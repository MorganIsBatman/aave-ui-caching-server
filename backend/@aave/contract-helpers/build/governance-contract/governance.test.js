"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const types_1 = require("../commons/types");
const IAaveGovernanceV2__factory_1 = require("./typechain/IAaveGovernanceV2__factory");
const IGovernanceStrategy__factory_1 = require("./typechain/IGovernanceStrategy__factory");
const IGovernanceV2Helper__factory_1 = require("./typechain/IGovernanceV2Helper__factory");
const types_2 = require("./types");
const index_1 = require("./index");
jest.mock('../commons/gasStation', () => {
    return {
        __esModule: true,
        estimateGasByNetwork: jest
            .fn()
            .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(1))),
        estimateGas: jest.fn(async () => Promise.resolve(ethers_1.BigNumber.from(1))),
    };
});
const proposalMock = {
    totalVotingSupply: ethers_1.BigNumber.from('16000000000000000000000000'),
    minimumQuorum: ethers_1.BigNumber.from('200'),
    minimumDiff: ethers_1.BigNumber.from('50'),
    executionTimeWithGracePeriod: ethers_1.BigNumber.from('1609537448'),
    proposalCreated: ethers_1.BigNumber.from('11512328'),
    id: ethers_1.BigNumber.from('0'),
    creator: '0xA7499Aa6464c078EeB940da2fc95C6aCd010c3Cc',
    executor: '0xEE56e2B3D491590B5b31738cC34d5232F378a8D5',
    targets: ['0x603696E8740b0Fa0b8aEFC202052ae757a59CF1b'],
    values: [ethers_1.BigNumber.from('0')],
    signatures: [''],
    calldatas: ['0x61461954'],
    withDelegatecalls: [true],
    startBlock: ethers_1.BigNumber.from('11512328'),
    endBlock: ethers_1.BigNumber.from('11531528'),
    executionTime: ethers_1.BigNumber.from('1609105448'),
    forVotes: ethers_1.BigNumber.from('414202518611435288338854'),
    againstVotes: ethers_1.BigNumber.from('100200001402134398906'),
    executed: true,
    canceled: false,
    strategy: '0xb7e383ef9B1E9189Fc0F71fb30af8aa14377429e',
    ipfsHash: '0x04d1fd83d352a7caa14408cee133be97b5919c3a5cf79a47ded3c9b658447d79',
    proposalState: 7,
    0: ethers_1.BigNumber.from('16000000000000000000000000'),
    1: ethers_1.BigNumber.from('200'),
    2: ethers_1.BigNumber.from('50'),
    3: ethers_1.BigNumber.from('1609537448'),
    4: ethers_1.BigNumber.from('11512328'),
    5: ethers_1.BigNumber.from('0'),
    6: '0xA7499Aa6464c078EeB940da2fc95C6aCd010c3Cc',
    7: '0xEE56e2B3D491590B5b31738cC34d5232F378a8D5',
    8: ['0x603696E8740b0Fa0b8aEFC202052ae757a59CF1b'],
    9: [ethers_1.BigNumber.from('0')],
    10: [''],
    11: ['0x61461954'],
    12: [true],
    13: ethers_1.BigNumber.from('11512328'),
    14: ethers_1.BigNumber.from('11531528'),
    15: ethers_1.BigNumber.from('1609105448'),
    16: ethers_1.BigNumber.from('414202518611435288338854'),
    17: ethers_1.BigNumber.from('100200001402134398906'),
    18: true,
    19: false,
    20: '0xb7e383ef9B1E9189Fc0F71fb30af8aa14377429e',
    21: '0x04d1fd83d352a7caa14408cee133be97b5919c3a5cf79a47ded3c9b658447d79',
    22: 7,
};
const userPowerMock = {
    votingPower: ethers_1.BigNumber.from('10000000000000000'),
    delegatedAddressVotingPower: '0x0000000000000000000000000000000000000003',
    propositionPower: ethers_1.BigNumber.from('10000000000000000'),
    delegatedAddressPropositionPower: '0x0000000000000000000000000000000000000003',
    0: ethers_1.BigNumber.from('10000000000000000'),
    1: '0x0000000000000000000000000000000000000003',
    2: ethers_1.BigNumber.from('10000000000000000'),
    3: '0x0000000000000000000000000000000000000003',
};
const voteMock = {
    support: true,
    votingPower: ethers_1.BigNumber.from('10000000000000000'),
    0: true,
    1: ethers_1.BigNumber.from('10000000000000000'),
};
describe('GovernanceService', () => {
    const provider = new ethers_1.providers.JsonRpcProvider();
    jest
        .spyOn(provider, 'getGasPrice')
        .mockImplementation(async () => Promise.resolve(ethers_1.BigNumber.from(1)));
    const GOVERNANCE_ADDRESS = '0x0000000000000000000000000000000000000001';
    const GOVERNANCE_HELPER_ADDRESS = '0x0000000000000000000000000000000000000002';
    const user = '0x0000000000000000000000000000000000000003';
    const proposalId = 1;
    describe('Initialization', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Expects to initialize with all params', () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
                GOVERNANCE_HELPER_ADDRESS,
            });
            expect(instance instanceof index_1.AaveGovernanceService).toEqual(true);
        });
        it('Expects to initialize without helper address', () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
            });
            expect(instance instanceof index_1.AaveGovernanceService).toEqual(true);
        });
    });
    describe('submitVote', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        const support = true;
        it('Expects the tx object when passing all params', async () => {
            var _a;
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
            });
            const voteTxObj = instance.submitVote({ user, proposalId, support });
            expect(voteTxObj.length).toEqual(1);
            expect(voteTxObj[0].txType).toEqual(types_1.eEthereumTxType.GOVERNANCE_ACTION);
            const tx = await voteTxObj[0].tx();
            expect(tx.to).toEqual(GOVERNANCE_ADDRESS);
            expect(tx.from).toEqual(user);
            expect(tx.gasLimit).toEqual(ethers_1.BigNumber.from(1));
            const decoded = ethers_1.utils.defaultAbiCoder.decode(['uint256', 'bool'], ethers_1.utils.hexDataSlice((_a = tx.data) !== null && _a !== void 0 ? _a : '', 4));
            expect(decoded[0]).toEqual(ethers_1.BigNumber.from(proposalId));
            expect(decoded[1]).toEqual(true);
            // gas price
            const gasPrice = await voteTxObj[0].gas();
            expect(gasPrice).not.toBeNull();
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasLimit).toEqual('1');
            expect(gasPrice === null || gasPrice === void 0 ? void 0 : gasPrice.gasPrice).toEqual('1');
        });
        it('Expects to fail when gov address not eth address', () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS: 'asdf',
            });
            const voteTxObj = instance.submitVote({ user, proposalId, support });
            expect(voteTxObj).toEqual([]);
        });
        it('Expects to fail when user not eht address', () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
            });
            const user = 'asdf';
            expect(() => instance.submitVote({ user, proposalId, support })).toThrowError(`Address: ${user} is not a valid ethereum Address`);
        });
        it('Expects to fail when proposalId not positive or 0', () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
            });
            const proposalId = -1;
            expect(() => instance.submitVote({ user, proposalId, support })).toThrowError(`Amount: ${proposalId} needs to be greater or equal than 0`);
        });
    });
    describe('getProposal', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Expects a proposal parsed if all params passed correctly', async () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
                GOVERNANCE_HELPER_ADDRESS,
            });
            const spy = jest
                .spyOn(IGovernanceV2Helper__factory_1.IGovernanceV2Helper__factory, 'connect')
                .mockReturnValue({
                getProposal: async () => Promise.resolve(proposalMock),
            });
            const proposal = await instance.getProposal({ proposalId: 1 });
            expect(spy).toHaveBeenCalled();
            expect(proposal).toEqual({
                id: Number(proposalMock.id.toString()),
                creator: proposalMock.creator,
                executor: proposalMock.executor,
                targets: proposalMock.targets,
                values: proposalMock.values,
                signatures: proposalMock.signatures,
                calldatas: proposalMock.calldatas,
                withDelegatecalls: proposalMock.withDelegatecalls,
                startBlock: Number(proposalMock.startBlock.toString()),
                endBlock: Number(proposalMock.endBlock.toString()),
                executionTime: proposalMock.executionTime.toString(),
                forVotes: proposalMock.forVotes.toString(),
                againstVotes: proposalMock.againstVotes.toString(),
                executed: proposalMock.executed,
                canceled: proposalMock.canceled,
                strategy: proposalMock.strategy,
                ipfsHash: proposalMock.ipfsHash,
                state: Object.values(types_2.ProposalState)[proposalMock.proposalState],
                minimumQuorum: proposalMock.minimumQuorum.toString(),
                minimumDiff: proposalMock.minimumDiff.toString(),
                executionTimeWithGracePeriod: proposalMock.executionTimeWithGracePeriod.toString(),
                proposalCreated: Number(proposalMock.proposalCreated.toString()),
                totalVotingSupply: proposalMock.totalVotingSupply.toString(),
            });
        });
    });
    describe('getProposals', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        const skip = 1;
        const limit = 2;
        it('Expects a proposal parsed if all params passed correctly', async () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
                GOVERNANCE_HELPER_ADDRESS,
            });
            const spy = jest
                .spyOn(IGovernanceV2Helper__factory_1.IGovernanceV2Helper__factory, 'connect')
                .mockReturnValue({
                getProposals: async () => Promise.resolve([proposalMock]),
            });
            const proposals = await instance.getProposals({ skip, limit });
            expect(spy).toHaveBeenCalled();
            expect(proposals[0]).toEqual({
                id: Number(proposalMock.id.toString()),
                creator: proposalMock.creator,
                executor: proposalMock.executor,
                targets: proposalMock.targets,
                values: proposalMock.values,
                signatures: proposalMock.signatures,
                calldatas: proposalMock.calldatas,
                withDelegatecalls: proposalMock.withDelegatecalls,
                startBlock: Number(proposalMock.startBlock.toString()),
                endBlock: Number(proposalMock.endBlock.toString()),
                executionTime: proposalMock.executionTime.toString(),
                forVotes: proposalMock.forVotes.toString(),
                againstVotes: proposalMock.againstVotes.toString(),
                executed: proposalMock.executed,
                canceled: proposalMock.canceled,
                strategy: proposalMock.strategy,
                ipfsHash: proposalMock.ipfsHash,
                state: Object.values(types_2.ProposalState)[proposalMock.proposalState],
                minimumQuorum: proposalMock.minimumQuorum.toString(),
                minimumDiff: proposalMock.minimumDiff.toString(),
                executionTimeWithGracePeriod: proposalMock.executionTimeWithGracePeriod.toString(),
                proposalCreated: Number(proposalMock.proposalCreated.toString()),
                totalVotingSupply: proposalMock.totalVotingSupply.toString(),
            });
        });
        it('Expects to fail if gov address not eth address', async () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS: 'asdf',
                ipfsGateway: 'https://cloudflare-ipfs.com/ipfs',
            });
            const getProposals = instance.getProposals({ skip, limit });
            expect(getProposals).toEqual([]);
        });
        it('Expects to fail if gov helper not eth address', async () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
                GOVERNANCE_HELPER_ADDRESS: 'asdf',
            });
            const getProposals = instance.getProposals({ skip, limit });
            expect(getProposals).toEqual([]);
        });
    });
    describe('getVotingPowerAt', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        const block = 1234;
        const strategy = '0xb7e383ef9b1e9189fc0f71fb30af8aa14377429e';
        it('Expects to get voting power at block', async () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
            });
            const spy = jest
                .spyOn(IGovernanceStrategy__factory_1.IGovernanceStrategy__factory, 'connect')
                .mockReturnValue({
                getVotingPowerAt: async () => Promise.resolve(ethers_1.BigNumber.from('10000000000000000')),
            });
            const power = await instance.getVotingPowerAt({
                user,
                block,
                strategy,
            });
            expect(spy).toHaveBeenCalled();
            expect(power).toEqual('0.01');
        });
        it('Expects to fail if gov address not eth address', async () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS: 'asdf',
            });
            const power = await instance.getVotingPowerAt({
                user,
                block,
                strategy,
            });
            expect(power).toEqual([]);
        });
        it('Expects to fail when user not eth address', async () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
            });
            const user = 'asdf';
            await expect(async () => instance.getVotingPowerAt({
                user,
                block,
                strategy,
            })).rejects.toThrowError(`Address: ${user} is not a valid ethereum Address`);
        });
    });
    describe('getTokensPower', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        const tokens = ['0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'];
        it('Expects token power obj for each token asked', async () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
                GOVERNANCE_HELPER_ADDRESS,
            });
            const spy = jest
                .spyOn(IGovernanceV2Helper__factory_1.IGovernanceV2Helper__factory, 'connect')
                .mockReturnValue({
                getTokensPower: async () => Promise.resolve([userPowerMock]),
            });
            const power = await instance.getTokensPower({
                user,
                tokens,
            });
            expect(spy).toHaveBeenCalled();
            expect(power[0]).toEqual(userPowerMock);
        });
        it('Expects to fail if gov address not eth address', async () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS: 'asdf',
            });
            const power = await instance.getTokensPower({
                user,
                tokens,
            });
            expect(power).toEqual([]);
        });
        it('Expects to fail if gov helper not eth address', async () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
                GOVERNANCE_HELPER_ADDRESS: 'asfd',
            });
            const power = await instance.getTokensPower({
                user,
                tokens,
            });
            expect(power).toEqual([]);
        });
        it('Expects to fail when user not eth address', async () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
                GOVERNANCE_HELPER_ADDRESS,
            });
            const user = 'asdf';
            await expect(async () => instance.getTokensPower({
                user,
                tokens,
            })).rejects.toThrowError(`Address: ${user} is not a valid ethereum Address`);
        });
        it('Expects to fail when tokens are not eth address', async () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
                GOVERNANCE_HELPER_ADDRESS,
            });
            const tokens = ['asdf'];
            await expect(async () => instance.getTokensPower({
                user,
                tokens,
            })).rejects.toThrowError(`Address: asdf is not a valid ethereum Address`);
        });
    });
    describe('getVoteOnProposal', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        it('Expects to get vote info for proposalId', async () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
                GOVERNANCE_HELPER_ADDRESS,
            });
            const spy = jest
                .spyOn(IAaveGovernanceV2__factory_1.IAaveGovernanceV2__factory, 'connect')
                .mockReturnValue({
                getVoteOnProposal: async () => Promise.resolve(voteMock),
            });
            const vote = await instance.getVoteOnProposal({
                user,
                proposalId,
            });
            expect(spy).toHaveBeenCalled();
            expect(vote).toEqual(voteMock);
        });
        it('Expects to fail if gov address not eth address', async () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS: 'asdf',
            });
            const power = await instance.getVoteOnProposal({
                user,
                proposalId,
            });
            expect(power).toEqual([]);
        });
        it('Expects to fail when user not eth address', async () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
                GOVERNANCE_HELPER_ADDRESS,
            });
            const user = 'asdf';
            await expect(async () => instance.getVoteOnProposal({
                user,
                proposalId,
            })).rejects.toThrowError(`Address: ${user} is not a valid ethereum Address`);
        });
        it('Expects to fail when proposalId not positive or 0', async () => {
            const instance = new index_1.AaveGovernanceService(provider, {
                GOVERNANCE_ADDRESS,
            });
            const proposalId = -1;
            await expect(async () => instance.getVoteOnProposal({
                user,
                proposalId,
            })).rejects.toThrowError(`Amount: ${proposalId} needs to be greater or equal than 0`);
        });
    });
});
//# sourceMappingURL=governance.test.js.map