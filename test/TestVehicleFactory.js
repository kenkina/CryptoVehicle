// Include web3 library so we can query accounts.
const Web3 = require('web3')
// Instantiate new web3 object pointing toward an Ethereum node.
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"))

const VehicleFactory = artifacts.require("VehicleFactory");

contract('VehicleFactory test', async (accounts) => {

  it("Zero vehicles", async () => {
    let instance = await VehicleFactory.deployed();
    let count = await instance.getVehiclesCount.call();
    assert.equal(count, 0);
  })
  
  it("Add vehicle 1", async () => {
    let instance = await VehicleFactory.deployed();
    
    let _numberPlate = "A7D023";
    let _brand = "TOYOTA";
    let _model = "HILUX SURF SSR G WIDE";
    let _color = "DORADO";
    let _serialNumber = "KZN1859025037";
    let _motorNumber = "1KZ0558403";
    let _reason = "Registro de nuevo vehículo";

    await instance.addVehicle(
      web3.utils.utf8ToHex(_numberPlate), web3.utils.utf8ToHex(_brand), web3.utils.utf8ToHex(_model),
      web3.utils.utf8ToHex(_color), web3.utils.utf8ToHex(_serialNumber), web3.utils.utf8ToHex(_motorNumber), web3.utils.utf8ToHex(_reason)
    );

    let count = await instance.getVehiclesCount.call();
    assert.equal(count, 1);

    let vehicle = {};
    [ 
      vehicle.numberPlate, vehicle.brand, vehicle.model,
      vehicle.color, vehicle.serialNumber, vehicle.motorNumber, vehicle.reason 
    ] = await instance.getVehicle.call(web3.utils.utf8ToHex(_numberPlate));

    assert.equal(web3.utils.hexToUtf8(vehicle.numberPlate), _numberPlate);
    assert.equal(web3.utils.hexToUtf8(vehicle.brand), _brand);
    assert.equal(web3.utils.hexToUtf8(vehicle.model), _model);
    assert.equal(web3.utils.hexToUtf8(vehicle.color), _color);
    assert.equal(web3.utils.hexToUtf8(vehicle.serialNumber), _serialNumber);
    assert.equal(web3.utils.hexToUtf8(vehicle.motorNumber), _motorNumber);
    assert.equal(web3.utils.hexToUtf8(vehicle.reason), _reason);
  });

  it("Add vehicle 2", async () => {
    let instance = await VehicleFactory.deployed();
    
    let _numberPlate = "A7D024";
    let _brand = "NISSAN";
    let _model = "FRONTIER VOLLEY CCD Y LOW";
    let _color = "PLATEADO";
    let _serialNumber = "KZN1859025038";
    let _motorNumber = "1KZ0558404";
    let _reason = "Registro de nuevo vehículo";

    await instance.addVehicle(
      web3.utils.utf8ToHex(_numberPlate), web3.utils.utf8ToHex(_brand), web3.utils.utf8ToHex(_model),
      web3.utils.utf8ToHex(_color), web3.utils.utf8ToHex(_serialNumber), web3.utils.utf8ToHex(_motorNumber), web3.utils.utf8ToHex(_reason)
    );

    let count = await instance.getVehiclesCount.call();
    assert.equal(count, 2);

    let vehicle = {};
    [ 
      vehicle.numberPlate, vehicle.brand, vehicle.model,
      vehicle.color, vehicle.serialNumber, vehicle.motorNumber, vehicle.reason 
    ] = await instance.getVehicle.call(web3.utils.utf8ToHex(_numberPlate));

    assert.equal(web3.utils.hexToUtf8(vehicle.numberPlate), _numberPlate);
    assert.equal(web3.utils.hexToUtf8(vehicle.brand), _brand);
    assert.equal(web3.utils.hexToUtf8(vehicle.model), _model);
    assert.equal(web3.utils.hexToUtf8(vehicle.color), _color);
    assert.equal(web3.utils.hexToUtf8(vehicle.serialNumber), _serialNumber);
    assert.equal(web3.utils.hexToUtf8(vehicle.motorNumber), _motorNumber);
    assert.equal(web3.utils.hexToUtf8(vehicle.reason), _reason);
  });


  it("Get vehicles", async () => {
    let instance = await VehicleFactory.deployed();
    
    let _numberPlates = ["A7D023", "A7D024"];

    let vehicles = await instance.getVehicles.call();
    assert.equal(vehicles.length, 2);

    vehicles.map((element, i) => {
      let vehicle = {};
      (vehicle.numberPlate) = element;
      assert.equal(web3.utils.hexToUtf8(vehicle.numberPlate), _numberPlates[i]);
    });
    
  });
  // ...

})