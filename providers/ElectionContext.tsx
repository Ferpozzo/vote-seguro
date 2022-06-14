import Web3 from 'web3';
import { HTTP_PROVIDER, ELECTION_CONTRACT_ADDRESS } from 'react-native-dotenv';
import { createContext } from 'react';
import ElectionArtifact from '../build/contracts/Election.json';
import BallotArtifact from '../build/contracts/Ballot.json';
import axios from 'axios';
import moment from 'moment';
const ElectionContext = createContext({
    election: {
    },
    setElection: (election: Election) => { }
});

export interface Candidate {
    name: string,
    party: string,
    number: number,
    img: string,
    voteCount?: number,
    creationDate?: number,
    expirationDate?: number
}
export interface Voters {
    address: string,
    voted: boolean
}
export interface Ballot {
    address?: string,
    name: string,
    description: string,
    startDate?: number,
    endDate?: number,
    candidates: Candidate[],
    manager?: string,
    votingDistrict: string,
    voters?: Voters[]
}
export interface Election {
    address?: string,
    name: string,
    description: string,
    deployedBallots?: string[]
}
export const testBallots: Ballot[] = [
    {
        name: 'Presidente CAES',
        description: 'Presidência do Centro Acadêmico de Eng. de Software',
        candidates: [
            {
                number: 650,
                name: 'Rubens Magro',
                party: 'PPEA Partido Perdido Estranho Amistoso',
                img: 'https://images.pexels.com/photos/5262378/pexels-photo-5262378.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
            },
            {
                number: 855,
                name: 'Márcia Marciel Matias',
                party: 'PJG Partido de Jogadore(a)s de Golf',
                img: 'https://images.pexels.com/photos/9716799/pexels-photo-9716799.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
            }
        ],
        votingDistrict: 'Dois Vizinhos - PR'
    },
    {
        name: 'Tesoureiro(a) CAES',
        description: 'Tesouraria do Centro Acadêmico de Eng. de Software',
        candidates: [
            {
                number: 244,
                name: 'Regina de Santos',
                party: 'PJG Partido de Jogadore(a)s de Golf',
                img: 'https://images.pexels.com/photos/10057623/pexels-photo-10057623.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
            },
            {
                number: 995,
                name: 'Ronaldo Augustinho',
                party: 'PPEA Partido Perdido Estranho da Amizade',
                img: 'https://images.pexels.com/photos/9481527/pexels-photo-9481527.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
            }
        ],
        votingDistrict: 'Dois Vizinhos - PR'
    }
]
/* 
address: '',
name: '',
description: '',
deployedBallots: [{
    address: '',
    ballotLifetime: 0,
    candidates: [{
        name: '',
        party: '',
        voteCount: 0,
        creationDate: 0,
        expirationDate: 0
    }],
    manager: '',
    votingDistrict: '',
    voters: [{
        address: '',
        voted: false
    }]
}] */
export const deployBallot = async (account: string, ballots: Ballot[]) => {
    const { contract, web3 } = loadContract()
    let candidatesNames: Array<string[]> = []
    let candidatesPartys: Array<string[]> = []
    let names: string[] = []
    let descriptions: string[] = []
    let numbers: Array<number[]> = []
    let images: Array<string[]> = []
    let districts: string[] = []
    let startDate = Date.now()
    let endDate = Date.now() + (moment(Date.now()).add(24, 'hours').unix())
    console.log(moment(endDate));

    for (let i = 0; i < ballots.length; i++) {
        candidatesNames[i] = ballots[i].candidates.map(c => c.name)
        candidatesPartys[i] = ballots[i].candidates.map(c => c.party)
        numbers[i] = ballots[i].candidates.map(c => c.number)
        images[i] = ballots[i].candidates.map(c => c.img)
        names[i] = ballots[i].name
        descriptions[i] = ballots[i].description
        districts[i] = ballots[i].votingDistrict
    }

    const data = await contract.methods.startElection(names, descriptions, candidatesNames, candidatesPartys, numbers, images, districts, startDate, endDate).encodeABI()

    const nonce = await web3.eth.getTransactionCount(account)

    const estimatedGas = await web3.eth.estimateGas({
        from: account,
        to: ELECTION_CONTRACT_ADDRESS,
        data: data
    })
    const params = {
        from: account,
        to: ELECTION_CONTRACT_ADDRESS,
        gas: web3.utils.toHex(estimatedGas),
        gasPrice: web3.utils.toHex(web3.utils.toWei('50', 'gwei')),
        data: data
    }

    return params
}
export const userAlreadyVoted = async (userAddress: string, ballotAddress: string) => {
    const { ballot, web3 } = loadBallotContract(ballotAddress)
    const voted = await ballot.methods.voters(userAddress).call()
    console.log(voted);
    
    return voted
}
export const loadBallots = async () => {
    const { contract, web3 } = loadContract()
    try {
        const deployedBallotsAddresses: string[] = await contract.methods.getDeployedBallots().call()
        let deployedBallots = []
        for (let i = 0; i < deployedBallotsAddresses.length; i++) {
            deployedBallots.push({ ballot: await loadBallotFromContract(deployedBallotsAddresses[i]), address: deployedBallotsAddresses[i] })
        }
        return deployedBallots
    } catch (error) {
        console.log(error);
    }
    return []
}
export const loadBallotFromContract = async (ballotAddress: string) => {

    const web3 = new Web3(new Web3.providers.HttpProvider(HTTP_PROVIDER))
    const contract = new web3.eth.Contract(BallotArtifact.abi, ballotAddress)
    const endDate = await contract.methods.endDate().call()
    console.log(endDate);

    let ballot: Array<any> = []
    if (moment.unix(parseInt(endDate)).toDate() > new Date()) {
        ballot = await contract.methods.getBallotRunning().call()
    } else {
        ballot = await contract.methods.getBallotEnded().call()
    }

    return ballot

}

export const createVote = async (voterAddress: string, ballotAddress: string, candidateIndex: number) => {
    const { ballot, web3 } = loadBallotContract(ballotAddress)

    const data = await ballot.methods.vote(candidateIndex).encodeABI()

    const nonce = await web3.eth.getTransactionCount(voterAddress)

    const estimatedGas = await web3.eth.estimateGas({
        from: voterAddress,
        to: ballotAddress,
        data: data
    })
    const params = {
        from: voterAddress,
        to: ballotAddress,
        gas: web3.utils.toHex(estimatedGas),
        gasPrice: web3.utils.toHex(web3.utils.toWei('50', 'gwei')),
        data: data
    }

    return params
}

export const loadBallotContract = (ballotAddress: string) => {
    const { contract, web3 } = loadContract()
    const ballotContract = new web3.eth.Contract(BallotArtifact.abi, ballotAddress)

    return { ballot: ballotContract, web3: web3 }
}

export const loadContract = () => {

    console.log(ELECTION_CONTRACT_ADDRESS);
    const web3 = new Web3(new Web3.providers.HttpProvider(HTTP_PROVIDER))
    const contract = new web3.eth.Contract(ElectionArtifact.abi, ELECTION_CONTRACT_ADDRESS)

    return { contract: contract, web3: web3 }
}

export default ElectionContext;