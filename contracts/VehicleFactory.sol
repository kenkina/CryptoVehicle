pragma solidity ^0.4.24;
//pragma experimental ABIEncoderV2;

import "./authorizable.sol";


contract VehicleFactory is Authorizable {

    // Structs
    struct Vehicle {
        // Inmutable
        bytes32 numberPlate;
        bytes32 brand;
        bytes32 model;

        // Mutable
        bytes32 color;
        bytes32 serialNumber; // chassis
        bytes32 motorNumber;
        bytes32 reason;

        string photos;
        string documents;
        bytes32[] ownersIds;
        bytes32[] ownersNames;

        address employeeAddress;
    }


    // Global variables
    bytes32[] private vehiclesNumberPlate;
    mapping (bytes32 => Vehicle) private vehicles;
    

    // Methods
    function getVehiclesCount() 
    public view returns (uint) {
        return vehiclesNumberPlate.length;
    }

    function getVehicles() 
    public view returns (bytes32[]) {
        return vehiclesNumberPlate;
    }

    function getVehiclesFiltered
    (
        bytes32 _numberPlate, 
        bytes32 _brand, bytes32 _model,
        bytes32 _color
    )
    public view returns (bytes32[]) {
        bytes32[] memory vehiclesFiltered = new bytes32[](vehiclesNumberPlate.length);
        uint count = 0;
        uint i = 0;
        for(i = 0; i<vehiclesNumberPlate.length; i++) {
            if( vehicles[vehiclesNumberPlate[i]].numberPlate == _numberPlate ||
                vehicles[vehiclesNumberPlate[i]].brand == _brand ||
                vehicles[vehiclesNumberPlate[i]].model == _model ||
                vehicles[vehiclesNumberPlate[i]].color == _color) {
                vehiclesFiltered[i] = vehiclesNumberPlate[i];
                count++;
            }
        }

        bytes32[] memory vehiclesResult = new bytes32[](count);
        uint j = 0;
        for(i = 0; i<vehiclesFiltered.length; i++) {
            if(vehiclesFiltered[i] != bytes32(0)) {
                vehiclesResult[j] = vehiclesFiltered[i];
                j++;
            }
        }

        return vehiclesResult;
    }

    function getVehicle
    (
        bytes32 _numberPlate
    )
    public view returns 
    (
        bytes32, bytes32, bytes32,
        bytes32, bytes32, bytes32, bytes32
    ) {
        Vehicle storage vehicle = vehicles[_numberPlate];
        return (
            vehicle.numberPlate, vehicle.brand, vehicle.model,
            vehicle.color, vehicle.serialNumber, vehicle.motorNumber, vehicle.reason
        );
    }

    function getVehicleDetail
    (
        bytes32 _numberPlate
    )
    public view returns
    (
        string, string, bytes32[], bytes32[],
        address
    ) {
        Vehicle storage vehicle = vehicles[_numberPlate];
        return (
            vehicle.photos, vehicle.documents, vehicle.ownersIds, vehicle.ownersNames,
            vehicle.employeeAddress
        );
    }

    function vehicleExists
    (
        bytes32 _numberPlate
    )
    public view returns (bool) {
        return vehicles[_numberPlate].numberPlate > 0;
    }

    function registerVehicle
    (
        bytes32 _numberPlate, bytes32 _brand, bytes32 _model,
        bytes32 _color, bytes32 _serialNumber, bytes32 _motorNumber, bytes32 _reason,
        string _photos, string _documents, bytes32[] _ownersId, bytes32[] _ownersNames
    )
    public onlyEmployee returns (bool) {
        require(_numberPlate > 0, "Number plate can not be empty.");
        require(vehicles[_numberPlate].numberPlate <= 0, "The vehicle is already registered.");

        Vehicle storage vehicle = vehicles[_numberPlate];
        vehicle.numberPlate = _numberPlate;
        vehicle.brand = _brand;
        vehicle.model = _model;

        vehicle.color = _color;
        vehicle.serialNumber = _serialNumber;
        vehicle.motorNumber = _motorNumber;
        vehicle.reason = _reason;

        vehicle.photos = _photos;
        vehicle.documents = _documents;
        vehicle.ownersIds = _ownersId;
        vehicle.ownersNames = _ownersNames;

        vehicle.employeeAddress = msg.sender;

        vehiclesNumberPlate.push(_numberPlate);
        return true;
    }

    function updateVehicle
    (
        bytes32 _numberPlate,
        bytes32 _color, bytes32 _serialNumber, bytes32 _motorNumber, bytes32 _reason
    )
    public onlyEmployee returns (bool) {
        require(_numberPlate > 0, "Number plate can not be empty.");
        require(vehicles[_numberPlate].numberPlate <= 0, "The vehicle is already registered.");

        Vehicle storage vehicle = vehicles[_numberPlate];

        vehicle.color = _color;
        vehicle.serialNumber = _serialNumber;
        vehicle.motorNumber = _motorNumber;
        vehicle.reason = _reason;

        vehicle.employeeAddress = msg.sender;

        vehiclesNumberPlate.push(_numberPlate);
        return true;
    }

    function updateVehiclePhotos
    (
        bytes32 _numberPlate,
        string _photos
    )
    public onlyEmployee returns (bool) {
        require(_numberPlate > 0, "Number plate can not be empty.");
        require(vehicles[_numberPlate].numberPlate > 0, "The vehicle is not registered.");

        vehicles[_numberPlate].photos = _photos;
        return true;
    }

    function updateVehicleDocuments
    (
        bytes32 _numberPlate,
        string _documents
    )
    public onlyEmployee returns (bool) {
        require(_numberPlate > 0, "Number plate can not be empty.");
        require(vehicles[_numberPlate].numberPlate > 0, "The vehicle is not registered.");

        vehicles[_numberPlate].documents = _documents;
        return true;
    }

    function updateVehicleOwner
    (
        bytes32 _numberPlate,
        bytes32[] _ownersId, bytes32[] _ownersNames
    )
    public onlyEmployee returns (bool) {
        require(_numberPlate > 0, "Number plate can not be empty.");
        require(vehicles[_numberPlate].numberPlate > 0, "The vehicle is not registered.");
        require(_ownersId.length == _ownersNames.length, "Owners data does not match.");

        vehicles[_numberPlate].ownersIds = _ownersId;
        vehicles[_numberPlate].ownersNames = _ownersNames;
        return true;
    }

}