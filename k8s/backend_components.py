from typing import Sequence, Optional

from kdsl.apps.v1 import Deployment, DeploymentSpec, DeploymentStrategy, RollingUpdateDeployment
from kdsl.core.v1 import Service, ServiceSpec, PodSpec, ObjectMeta, ContainerItem, Probe, ExecAction, EnvVarSource, \
    EnvVarItem, ObjectFieldSelector
from kdsl.extra import mk_env
from kdsl.recipe import choice, collection

import values

env = mk_env(
    REDIS_HOST="redis",
    RPC_URL=choice(
        chain1=values.MAINNET_RPC,
        chain137=values.POLYGON_RPC,
        chain43114="https://api.avax.network/ext/bc/C/rpc"
    ),
    CHAIN_ID=values.CHAIN_ID,
)
env = {**env, **dict(POD_IP=EnvVarItem(
    valueFrom=EnvVarSource(
        fieldRef=ObjectFieldSelector(
            fieldPath="status.podIP"
        )
    )
))}

api_probe = Probe(
    exec=ExecAction(
        command="curl -XPOST --header content-type:application/json --data '{\"query\":\"query{__typename}\"}' http://localhost:3000/graphql".split()
    ),
    initialDelaySeconds=10,
    periodSeconds=15,
    timeoutSeconds=3
)

worker_probe = Probe(
    exec=ExecAction(
        command="ps -p 1".split()
    ),
    initialDelaySeconds=5,
    periodSeconds=15
)


def mk_backend_entries(
        name: str,
        command: Sequence[str],
        readiness_probe: Probe = worker_probe,
        port: Optional[int] = None,
        scale: int = 1,
):
    labels = dict(component=name, **values.shared_labels)

    metadata = ObjectMeta(
        name=name,
        namespace=values.NAMESPACE,
        labels=labels,
        annotations=values.shared_annotations
    )

    if port is not None:
        service = Service(
            metadata=metadata,
            spec=ServiceSpec(
                selector=labels,
                ports={
                    port: dict(name="http"),
                },
            ),
        )
        service_list = [service]
        container_ports_mixin = dict(
            ports={
                port: dict(name="http", protocol="TCP"),
            }
        )
    else:
        service_list = []
        container_ports_mixin = dict()

    pod_spec = PodSpec(
        containers=dict(
            main=ContainerItem(
                image=values.IMAGE,
                imagePullPolicy="Always",
                **container_ports_mixin,
                command=command,
                env=env,
                readinessProbe=readiness_probe
            ),
        ),
    )

    deployment = Deployment(
        metadata=metadata,
        spec=DeploymentSpec(
            replicas=scale,
            selector=dict(matchLabels=labels),
            progressDeadlineSeconds=180,
            strategy=DeploymentStrategy(
                type="RollingUpdate",
                rollingUpdate=RollingUpdateDeployment(
                    maxUnavailable=0,
                    maxSurge=1,
                ),
            ),
            template=dict(
                metadata=ObjectMeta(
                    labels=labels,
                    annotations=values.shared_annotations
                ),
                spec=pod_spec,
            ),
        ),
    )

    return [*service_list, deployment]


entries = collection(
    base=[
        *mk_backend_entries(
            name="api",
            command=["npm", "run", "prod"],
            readiness_probe=api_probe,
            port=3000,
            scale=2
        ),
        *mk_backend_entries(
            name="protocol-data-loader",
            command=["npm", "run", "job:update-general-reserves-data"],
        ),
        *mk_backend_entries(
            name="reserve-incentives",
            command=["npm", "run", "job:update-reserve-incentives-data"],
        ),
        *mk_backend_entries(
            name="user-incentives",
            command=["npm", "run", "job:update-users-incentives-data"],
        ),
        *mk_backend_entries(
            name="user-data-loader",
            command=["npm", "run", "job:update-users-data"],
        ),
        *mk_backend_entries(
            name="update-block-number-loader",
            command=["npm", "run", "job:update-block-number"],
        ),
    ],
    chain1=[
        *mk_backend_entries(
            name="stake-general-data-loader",
            command=["npm", "run", "job:update-stake-general-ui-data"],
        ),
        *mk_backend_entries(
            name="stake-user-data-loader",
            command=["npm", "run", "job:update-stake-user-ui-data"],
        ),
    ],
)
