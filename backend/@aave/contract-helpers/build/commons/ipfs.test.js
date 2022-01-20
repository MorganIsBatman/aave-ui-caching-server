"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("ethers/lib/utils");
const isomorphic_unfetch_1 = __importDefault(require("isomorphic-unfetch"));
const ipfs_1 = require("./ipfs");
jest.mock('isomorphic-unfetch', () => jest.fn());
describe('ipfs', () => {
    const hash = '0x04d1fd83d352a7caa14408cee133be97b5919c3a5cf79a47ded3c9b658447d79';
    describe('getLink', () => {
        it('Expects the link to be correct', () => {
            const link = ipfs_1.getLink(hash, 'https://cloudflare-ipfs.com/ipfs');
            expect(link).toEqual('https://cloudflare-ipfs.com/ipfs/0x04d1fd83d352a7caa14408cee133be97b5919c3a5cf79a47ded3c9b658447d79');
        });
    });
    describe('getProposalMetadata', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        const mockFetch = isomorphic_unfetch_1.default;
        it('Expects to return metadata when hash complete', async () => {
            const ipfsHash = utils_1.base58.encode(Buffer.from(`1220${hash.slice(2)}`, 'hex'));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const json = jest.fn();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            json.mockResolvedValue({
                title: 'mockTitle',
                description: 'mockDescription',
                shortDescription: 'mockShortDescription',
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            mockFetch.mockResolvedValue({ ok: true, json });
            const metadata = await ipfs_1.getProposalMetadata(hash);
            expect(json.mock.calls.length).toEqual(1);
            expect(metadata).toEqual({
                title: 'mockTitle',
                description: 'mockDescription',
                shortDescription: 'mockShortDescription',
                ipfsHash,
            });
        });
        it('Expects to return metadata when hash complete and when repeating hash', async () => {
            const hash = '0x04d1fd83d352a7caa14408cee133be97b5919c3a5cf79a47ded3c9b658447d78';
            const ipfsHash = utils_1.base58.encode(Buffer.from(`1220${hash.slice(2)}`, 'hex'));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const json = jest.fn();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            json.mockResolvedValue({
                title: 'mockTitle',
                description: 'mockDescription',
                shortDescription: 'mockShortDescription',
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            mockFetch.mockResolvedValue({ ok: true, json });
            const metadata = await ipfs_1.getProposalMetadata(ipfsHash);
            const metadata2 = await ipfs_1.getProposalMetadata(hash);
            expect(json.mock.calls.length).toEqual(1);
            expect(metadata).toEqual({
                title: 'mockTitle',
                description: 'mockDescription',
                shortDescription: 'mockShortDescription',
                ipfsHash,
            });
            expect(metadata2).toEqual({
                title: 'mockTitle',
                description: 'mockDescription',
                shortDescription: 'mockShortDescription',
                ipfsHash,
            });
        });
        it('Expects to fail if there is no title', async () => {
            const hash = '0x04d1fd83d352a7caa14408cee133be97b5919c3a5cf79a47ded3c9b658447d77';
            const ipfsHash = utils_1.base58.encode(Buffer.from(`1220${hash.slice(2)}`, 'hex'));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const json = jest.fn();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            json.mockResolvedValue({
                description: 'mockDescription',
                shortDescription: 'mockShortDescription',
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            mockFetch.mockResolvedValue({ ok: true, json });
            const metadata = await ipfs_1.getProposalMetadata(hash);
            expect(json.mock.calls.length).toEqual(1);
            expect(metadata).toEqual({
                title: `Proposal - ${ipfsHash}`,
                description: `Proposal with invalid metadata format or IPFS gateway is down`,
                shortDescription: `Proposal with invalid metadata format or IPFS gateway is down`,
                ipfsHash,
                aip: 0,
                author: `Proposal with invalid metadata format or IPFS gateway is down`,
                discussions: `Proposal with invalid metadata format or IPFS gateway is down`,
            });
        });
        it('Expects to fail if there is no description', async () => {
            const hash = '0x04d1fd83d352a7caa14408cee133be97b5919c3a5cf79a47ded3c9b658447d76';
            const ipfsHash = utils_1.base58.encode(Buffer.from(`1220${hash.slice(2)}`, 'hex'));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const json = jest.fn();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            json.mockResolvedValue({
                title: 'mockTitle',
                shortDescription: 'mockShortDescription',
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            mockFetch.mockResolvedValue({ ok: true, json });
            const metadata = await ipfs_1.getProposalMetadata(hash);
            expect(json.mock.calls.length).toEqual(1);
            expect(metadata).toEqual({
                title: `Proposal - ${ipfsHash}`,
                description: `Proposal with invalid metadata format or IPFS gateway is down`,
                shortDescription: `Proposal with invalid metadata format or IPFS gateway is down`,
                ipfsHash,
                aip: 0,
                author: `Proposal with invalid metadata format or IPFS gateway is down`,
                discussions: `Proposal with invalid metadata format or IPFS gateway is down`,
            });
        });
        it('Expects to fail if there is no shortDescription', async () => {
            const hash = '0x04d1fd83d352a7caa14408cee133be97b5919c3a5cf79a47ded3c9b658447d75';
            const ipfsHash = utils_1.base58.encode(Buffer.from(`1220${hash.slice(2)}`, 'hex'));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const json = jest.fn();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            json.mockResolvedValue({
                title: 'mockTitle',
                description: 'mockDescription',
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            mockFetch.mockResolvedValue({ ok: true, json });
            const metadata = await ipfs_1.getProposalMetadata(hash);
            expect(json.mock.calls.length).toEqual(1);
            expect(metadata).toEqual({
                title: `Proposal - ${ipfsHash}`,
                description: `Proposal with invalid metadata format or IPFS gateway is down`,
                shortDescription: `Proposal with invalid metadata format or IPFS gateway is down`,
                ipfsHash,
                aip: 0,
                author: `Proposal with invalid metadata format or IPFS gateway is down`,
                discussions: `Proposal with invalid metadata format or IPFS gateway is down`,
            });
        });
        it('Expects to fail if there is no data', async () => {
            const hash = '0x04d1fd83d352a7caa14408cee133be97b5919c3a5cf79a47ded3c9b658447d74';
            const ipfsHash = utils_1.base58.encode(Buffer.from(`1220${hash.slice(2)}`, 'hex'));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const json = jest.fn();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            json.mockResolvedValue({});
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            mockFetch.mockResolvedValue({ ok: true, json });
            const metadata = await ipfs_1.getProposalMetadata(hash);
            expect(json.mock.calls.length).toEqual(1);
            expect(metadata).toEqual({
                title: `Proposal - ${ipfsHash}`,
                description: `Proposal with invalid metadata format or IPFS gateway is down`,
                shortDescription: `Proposal with invalid metadata format or IPFS gateway is down`,
                ipfsHash,
                aip: 0,
                author: `Proposal with invalid metadata format or IPFS gateway is down`,
                discussions: `Proposal with invalid metadata format or IPFS gateway is down`,
            });
        });
        it('Expects to fail if there is no response ok', async () => {
            const hash = '0x04d1fd83d352a7caa14408cee133be97b5919c3a5cf79a47ded3c9b658447d74';
            const ipfsHash = utils_1.base58.encode(Buffer.from(`1220${hash.slice(2)}`, 'hex'));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const json = jest.fn();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            json.mockResolvedValue({});
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            mockFetch.mockResolvedValue({ ok: false, json });
            const metadata = await ipfs_1.getProposalMetadata(hash);
            expect(json.mock.calls.length).toEqual(0);
            expect(metadata).toEqual({
                title: `Proposal - ${ipfsHash}`,
                description: `Proposal with invalid metadata format or IPFS gateway is down`,
                shortDescription: `Proposal with invalid metadata format or IPFS gateway is down`,
                ipfsHash,
                aip: 0,
                author: `Proposal with invalid metadata format or IPFS gateway is down`,
                discussions: `Proposal with invalid metadata format or IPFS gateway is down`,
            });
        });
    });
});
//# sourceMappingURL=ipfs.test.js.map