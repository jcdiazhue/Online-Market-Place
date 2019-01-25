var MarketPlace = artifacts.require("MarketPlace");
var Utilities = artifacts.require("Utilities");

module.exports = function(deployer) {
  deployer.deploy(Utilities);
  deployer.link(Utilities, MarketPlace);
  deployer.deploy(MarketPlace);
};
