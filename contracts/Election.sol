// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

contract Election {
    address[] public deployedBallots;
    string public name;
    string public description;

    constructor(string memory _name, string memory _description) {
        name = _name;
        description = _description;
    }

    function startElection(
        string[] memory names,
        string[] memory descriptions,
        string[][] memory candidates,
        string[][] memory partys,
        uint256[][] memory numbers,
        string[][] memory images,
        string[] memory districts,
        uint256 startDate,
        uint256 endDate,
        address[][] memory _voters
    ) public {
        for (uint256 i = 0; i < districts.length; i++) {
            Ballot newBallot = new Ballot(
                names[i],
                descriptions[i],
                candidates[i],
                partys[i],
                numbers[i],
                images[i],
                districts[i],
                msg.sender,
                startDate,
                endDate,
                _voters[i]
            );
            deployedBallots.push(address(newBallot));
        }
    }

    function getDeployedBallots() public view returns (address[] memory) {
        return deployedBallots;
    }
}

contract Ballot {
    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 number;
        string img;
        uint256 voteCount;
    }
    struct SecretVotesCandidate {
        uint256 id;
        string name;
        string party;
        uint256 number;
        string img;
    }
    struct BallotRunningInformations {
        string name;
        string description;
        string votingDistrict;
        uint256 startDate;
        uint256 endDate;
        SecretVotesCandidate[] candidates;
    }
    struct BallotInformations {
        string name;
        string description;
        string votingDistrict;
        uint256 startDate;
        uint256 endDate;
        Candidate[] candidates;
    }
    struct CandidatesAlreadyVoted {
        uint256 candidateIndex;
        uint256 dateOfVote;
    }
    string public name;
    string public description;
    uint256 public startDate;
    uint256 public endDate;
    Candidate[] public candidates;
    SecretVotesCandidate[] public secretVotesCandidates;
    address public manager;
    string public votingDistrict;
    mapping(address => bool) public voters;
    mapping(address => bool) public rigthToVote;
    mapping(address => uint256) public lastVote;

    modifier restricted() {
        require(
            msg.sender == manager,
            "Voce nao e o dono do contrato para realizar esta acao"
        );
        _;
    }
    modifier hasRigthToVote() {
        require(
            rigthToVote[msg.sender],
            "Voce nao tem direito de voto nesta votacao"
        );
        _;
    }
    modifier ballotIsRunning() {
        require(
            block.timestamp > startDate && block.timestamp < endDate,
            "A votacao nao esta ocorrendo, confira as datas"
        );
        _;
    }

    modifier ballotEnded() {
        require(
            (block.timestamp > endDate),
            "A votacao nao terminou, aguarde o termino para utilizar esta funcao."
        );
        _;
    }

    constructor(
        string memory _name,
        string memory _description,
        string[] memory candidateNames,
        string[] memory candidateParty,
        uint256[] memory candidateNumbers,
        string[] memory candidateImages,
        string memory district,
        address creator,
        uint256 _startDate,
        uint256 _endDate,
        address[] memory _voters
    ) {
        manager = creator;
        votingDistrict = district;
        startDate = _startDate;
        endDate = _endDate;
        name = _name;
        description = _description;
        for (uint256 i = 0; i < _voters.length; i++) {
            rigthToVote[_voters[i]] = true;
        }
        for (uint256 i = 0; i < candidateNames.length; i++) {
            candidates.push(
                Candidate({
                    id: candidates.length,
                    name: candidateNames[i],
                    party: candidateParty[i],
                    number: candidateNumbers[i],
                    img: candidateImages[i],
                    voteCount: 0
                })
            );
            secretVotesCandidates.push(
                SecretVotesCandidate({
                    id: secretVotesCandidates.length,
                    name: candidateNames[i],
                    party: candidateParty[i],
                    number: candidateNumbers[i],
                    img: candidateImages[i]
                })
            );
        }
    }

    function vote(uint256 index) public hasRigthToVote ballotIsRunning {
        if (!voters[msg.sender]) {
            candidates[index].voteCount += 1;
            lastVote[msg.sender] = index;
            voters[msg.sender] = true;
        } else {
            candidates[lastVote[msg.sender]].voteCount -= 1;
            candidates[index].voteCount += 1;
            lastVote[msg.sender] = index;
        }
    }

    function giveRigthToVote(address[] memory _addresses) private restricted {
        for (uint256 i = 0; i < _addresses.length; i++) {
            rigthToVote[_addresses[i]] = true;
        }
    }

    function getCandidateName(uint256 index)
        public
        view
        returns (string memory)
    {
        return candidates[index].name;
    }

    function getCandidateParty(uint256 index)
        public
        view
        returns (string memory)
    {
        return candidates[index].party;
    }

    function getCandidateVoteCount(uint256 index)
        public
        view
        ballotEnded
        returns (uint256)
    {
        return candidates[index].voteCount;
    }

    function getBallotRunning()
        public
        view
        ballotIsRunning
        returns (BallotRunningInformations memory _ballot)
    {
        _ballot = BallotRunningInformations({
            name: name,
            description: description,
            votingDistrict: votingDistrict,
            startDate: startDate,
            endDate: endDate,
            candidates: secretVotesCandidates
        });
        return _ballot;
    }

    function getBallotEnded()
        public
        view
        ballotEnded
        returns (BallotInformations memory _ballot)
    {
        _ballot = BallotInformations({
            name: name,
            description: description,
            votingDistrict: votingDistrict,
            startDate: startDate,
            endDate: endDate,
            candidates: candidates
        });
        return _ballot;
    }

    function getWinner()
        external
        view
        ballotEnded
        returns (Candidate[] memory)
    {
        uint256 winnerVoteCount = 0;
        uint256 winnerCount = 1;
        Candidate memory winner;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > winnerVoteCount) {
                winnerVoteCount = candidates[i].voteCount;
                winner = candidates[i];
            }
        }
        for (uint256 i = 0; i < candidates.length; i++) {
            if (
                winnerVoteCount == candidates[i].voteCount &&
                winner.id != candidates[i].id
            ) {
                winnerCount += 1;
            }
        }
        Candidate[] memory winners = new Candidate[](winnerCount);
        if (winnerCount > 1) {
            uint256 j = 0;
            for (uint256 i = 0; i < candidates.length; i++) {
                if (winnerVoteCount == candidates[i].voteCount) {
                    winners[j] = candidates[i];
                    j++;
                }
            }
        } else {
            winners[0] = winner;
        }
        return winners;
    }

    function getTotalVotes()
        public
        view
        ballotEnded
        returns (uint256 _totalVotes)
    {
        _totalVotes = 0;
        for (uint256 i = 0; i < candidates.length; i++) {
            _totalVotes += candidates[i].voteCount;
        }
    }
}
