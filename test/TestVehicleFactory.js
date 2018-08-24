const VehicleFactory = artifacts.require("VehicleFactory");

contract('VehicleFactory test', async (accounts) => {

  it("Zero vehicles", async () => {
    let instance = await VehicleFactory.deployed();
    let count = await instance.getVehiclesCount.call();
    assert.equal(count, 0);
  })
  
  it("Add a vehicle", async () => {
    let instance = await VehicleFactory.deployed();
    
    let _numberPlate = "asd-dsa";
    let _brand = "Nissan";
    let _model = "Frontier";
    let _color = "azul";
    let _serialNumber = "a1s2d3";
    let _motorNumber = "motor123";
    let _reason = "Registro de nuevo vehículo";

    await instance.addVehicle(
      _numberPlate, _brand, _model,
      _color, _serialNumber, _motorNumber, _reason
    );

    let count = await instance.getVehiclesCount.call();
    assert.equal(count, 1);

    let vehicle = {};
    [ 
      vehicle.numberPlate, vehicle.brand, vehicle.model,
      vehicle.color, vehicle.serialNumber, vehicle.motorNumber, vehicle.reason 
    ] = await instance.getVehicle.call(_numberPlate);

    assert.equal(vehicle.brand, _brand);
    assert.equal(vehicle.model, _model);
    assert.equal(vehicle.color, _color);
  });

  // ...

})