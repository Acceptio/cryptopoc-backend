pragma solidity ^0.4.2;

contract AcceptPay {
  address public owner;

  modifier onlyOwner() {
    if (msg.sender == owner)
    _;
  }

  function transferOwnership(address newOwner) onlyOwner {
    if (newOwner != address(0)) owner = newOwner;
  }

  function kill() onlyOwner {
    selfdestruct(owner);
  }

  enum State { Inactive, Active, Review, Completed, Dispute, Pending, Canceled }

  State contractState;

  address seller;
  address buyer;
  uint startDate;
  uint endDate;
  bytes32 terms;

  address cancelRequestedBy;

  mapping (address => bool) activated;

  function AcceptPay(
    uint _startDate,
    uint _endDate,
    bytes32 _terms,
    address _seller,
    address _buyer
  ) {
    owner = msg.sender;
    contractState = State.Inactive;
    seller = _seller;
    buyer = _buyer;
    startDate = _startDate;
    endDate = _endDate;
    terms = _terms;
  }

  modifier onlyParticipant() {
    if (msg.sender == seller || msg.sender == buyer)
    _;
  }

  modifier onlySeller() {
    if (msg.sender == seller)
    _;
  }

  modifier onlyBuyer() {
    if (msg.sender == buyer)
    _;
  }

  function getContractState()
  onlyParticipant
  view
  returns (uint8) {
    return uint8(contractState);
  }

  function getContractDetails()
  onlyParticipant
  view
  returns (uint, uint, address, address, bytes32, uint8, bool, bool) {
    return (startDate, endDate, seller, buyer, terms, uint8(contractState), activated[msg.sender], cancelRequestedBy == msg.sender);
  }

  function cancel() onlyParticipant {
    require(contractState == State.Inactive || contractState == State.Active);
    if (contractState == State.Inactive && (now < startDate || now > endDate)) {
      contractState = State.Canceled;
    }
    if (contractState == State.Active) {
      cancelRequestedBy = msg.sender;
      contractState = State.Pending;
    }
  }

  function resolvePending(bool decision) onlyParticipant {
    require(contractState == State.Pending);
    require(msg.sender != cancelRequestedBy);
    if (decision == true) {
      contractState = State.Canceled;
    } else {
      contractState = State.Dispute;
    }
  }

  function activate() onlyParticipant {
    require(activated[msg.sender] != true && contractState == State.Inactive);
    activated[msg.sender] = true;
    if ((msg.sender == seller && activated[buyer] == true) || (msg.sender == buyer && activated[seller] == true)) {
      contractState = State.Active;
    }
  }

  function review() onlyBuyer {
    require(contractState == State.Active);
    contractState = State.Review;
  }

  function resolveReview(bool decision) onlySeller {
    require(contractState == State.Review);
    if (decision == true) {
      contractState = State.Completed;
    } else {
      contractState = State.Dispute;
    }
  }

  function resolveDispute(bool decision) onlyOwner {
    require(contractState == State.Dispute);
    if (decision == true) {
      contractState = State.Completed;
    } else {
      contractState = State.Canceled;
    }
  }
}
