var Authorizable = artifacts.require("./Authorizable.sol");
var VehicleFactory = artifacts.require("./VehicleFactory.sol");
var StoreHash = artifacts.require("./Contract.sol");

module.exports = function(deployer) {
  deployer.deploy(
    [
      Authorizable,
      VehicleFactory,
      StoreHash
    ]
  );
};