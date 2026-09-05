const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BakeryLoyaltyCard", function () {
  let BakeryLoyaltyCard;
  let contract;
  let owner;
  let staff;
  let customer;
  let unauthorizedUser;

  beforeEach(async function () {
    [owner, staff, customer, unauthorizedUser] = await ethers.getSigners();
    BakeryLoyaltyCard = await ethers.getContractFactory("BakeryLoyaltyCard");
    contract = await BakeryLoyaltyCard.deploy();
    await contract.waitForDeployment();

    // Authorize staff
    await contract.connect(owner).setStaffAuthorization(staff.address, true);
  });

  describe("Deployment & Authorization", function () {
    it("Should set Ramesh (deployer) as owner and authorized staff", async function () {
      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.authorizedStaff(owner.address)).to.be.true;
    });

    it("Should allow owner to authorize new counter staff", async function () {
      expect(await contract.authorizedStaff(staff.address)).to.be.true;
    });

    it("Should reject non-owner trying to authorize staff", async function () {
      await expect(
        contract.connect(unauthorizedUser).setStaffAuthorization(unauthorizedUser.address, true)
      ).to.be.revertedWith("Only Ramesh (Owner) can perform this action");
    });
  });

  describe("Awarding Stamps", function () {
    it("Should allow authorized staff to award a stamp to customer", async function () {
      await expect(contract.connect(staff).awardStamp(customer.address))
        .to.emit(contract, "StampAwarded")
        .withArgs(customer.address, 1, 1, staff.address);

      const details = await contract.getCardDetails(customer.address);
      expect(details.currentStamps).to.equal(1);
      expect(details.lifetimeCount).to.equal(1);
      expect(details.isEligibleForFreeCake).to.be.false;
    });

    it("Should reject stamp award from unauthorized account", async function () {
      await expect(
        contract.connect(unauthorizedUser).awardStamp(customer.address)
      ).to.be.revertedWith("Unauthorized: Only authorized bakery staff can punch loyalty cards");
    });

    it("Should prevent stamping beyond 10 stamps without redeeming free cake", async function () {
      for (let i = 0; i < 10; i++) {
        await contract.connect(staff).awardStamp(customer.address);
      }

      const details = await contract.getCardDetails(customer.address);
      expect(details.currentStamps).to.equal(10);
      expect(details.isEligibleForFreeCake).to.be.true;

      // 11th stamp should fail
      await expect(
        contract.connect(staff).awardStamp(customer.address)
      ).to.be.revertedWith("Card is already full! Please redeem your free cake first");
    });
  });

  describe("Free Cake Redemption", function () {
    it("Should reject redemption if customer has fewer than 10 stamps", async function () {
      await contract.connect(staff).awardStamp(customer.address);
      await expect(
        contract.connect(staff).redeemFreeCake(customer.address)
      ).to.be.revertedWith("Insufficient stamps: 10 stamps required for a free cake");
    });

    it("Should successfully redeem cake at 10 stamps and reset balance", async function () {
      for (let i = 0; i < 10; i++) {
        await contract.connect(staff).awardStamp(customer.address);
      }

      await expect(contract.connect(staff).redeemFreeCake(customer.address))
        .to.emit(contract, "CakeRedeemed")
        .withArgs(customer.address, 1, staff.address);

      const details = await contract.getCardDetails(customer.address);
      expect(details.currentStamps).to.equal(0);
      expect(details.redeemedCakes).to.equal(1);
      expect(details.lifetimeCount).to.equal(10);
      expect(details.isEligibleForFreeCake).to.be.false;
    });
  });
});
