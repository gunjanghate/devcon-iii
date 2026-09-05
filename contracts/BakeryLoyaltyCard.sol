// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BakeryLoyaltyCard
 * @notice On-chain, tamper-proof loyalty card for Ramesh's Bakery.
 *         Replaces physical paper punch cards with cryptographic stamps
 *         that cannot be photocopied or forged.
 *         Rule: 10 stamps = 1 free artisan cake!
 */
contract BakeryLoyaltyCard {
    address public owner;
    
    // Total stamps needed for a free cake reward
    uint256 public constant STAMPS_FOR_FREE_CAKE = 10;

    // Authorized bakery staff addresses who can punch cards
    mapping(address => bool) public authorizedStaff;

    // Mapping from customer wallet address => current active stamp count (0 to 10)
    mapping(address => uint256) public stampBalance;

    // Mapping from customer wallet address => lifetime total stamps earned
    mapping(address => uint256) public lifetimeStamps;

    // Mapping from customer wallet address => total cakes redeemed
    mapping(address => uint256) public cakesRedeemed;

    // Events
    event StaffAuthorized(address indexed staffMember, bool isAuthorized);
    event StampAwarded(
        address indexed customer,
        uint256 currentBalance,
        uint256 lifetimeTotal,
        address indexed awardedBy
    );
    event CakeRedeemed(
        address indexed customer,
        uint256 totalCakesRedeemed,
        address indexed processedBy
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only Ramesh (Owner) can perform this action");
        _;
    }

    modifier onlyStaffOrOwner() {
        require(
            msg.sender == owner || authorizedStaff[msg.sender],
            "Unauthorized: Only authorized bakery staff can punch loyalty cards"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedStaff[msg.sender] = true;
        emit StaffAuthorized(msg.sender, true);
    }

    /**
     * @notice Authorize or revoke bakery counter staff members
     */
    function setStaffAuthorization(address staffMember, bool isAuthorized) external onlyOwner {
        require(staffMember != address(0), "Invalid staff address");
        authorizedStaff[staffMember] = isAuthorized;
        emit StaffAuthorized(staffMember, isAuthorized);
    }

    /**
     * @notice Award a single stamp to a customer's loyalty card
     * @dev Called only by server using authorized bakery staff credentials after verifying Privy token
     * @param customer The customer's Ethereum address (derived server-side from verified Privy claims)
     */
    function awardStamp(address customer) external onlyStaffOrOwner returns (uint256) {
        require(customer != address(0), "Invalid customer address");
        require(
            stampBalance[customer] < STAMPS_FOR_FREE_CAKE,
            "Card is already full! Please redeem your free cake first"
        );

        stampBalance[customer] += 1;
        lifetimeStamps[customer] += 1;

        emit StampAwarded(
            customer,
            stampBalance[customer],
            lifetimeStamps[customer],
            msg.sender
        );

        return stampBalance[customer];
    }

    /**
     * @notice Redeem 10 stamps for a free cake
     * @param customer The customer's Ethereum address
     */
    function redeemFreeCake(address customer) external onlyStaffOrOwner {
        require(customer != address(0), "Invalid customer address");
        require(
            stampBalance[customer] >= STAMPS_FOR_FREE_CAKE,
            "Insufficient stamps: 10 stamps required for a free cake"
        );

        stampBalance[customer] -= STAMPS_FOR_FREE_CAKE;
        cakesRedeemed[customer] += 1;

        emit CakeRedeemed(customer, cakesRedeemed[customer], msg.sender);
    }

    /**
     * @notice Helper to get comprehensive card details for a customer
     */
    function getCardDetails(address customer) external view returns (
        uint256 currentStamps,
        uint256 lifetimeCount,
        uint256 redeemedCakes,
        bool isEligibleForFreeCake
    ) {
        currentStamps = stampBalance[customer];
        lifetimeCount = lifetimeStamps[customer];
        redeemedCakes = cakesRedeemed[customer];
        isEligibleForFreeCake = (currentStamps >= STAMPS_FOR_FREE_CAKE);
    }
}
