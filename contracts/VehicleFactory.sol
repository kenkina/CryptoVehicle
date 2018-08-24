pragma solidity ^0.4.24;
//pragma experimental ABIEncoderV2;

import "./authorizable.sol";


contract VehicleFactory is Authorizable {

    constructor() public {
        
    }

    struct Vehicle {
        // Inmutable
        string numberPlate;
        string brand;
        string model;

        // Mutable
        string color;
        string serialNumber; // chassis
        string motorNumber;
        string reason;

        string[] photos;
        string[] documents;
        VehicleOwner[] owners;
        address employeeAddress;
    }

    struct VehicleOwner {
        uint dni;
        string name;
    }


    bytes32[] private vehiclesNumberPlate;
    mapping (bytes32 => Vehicle) private vehicles;
    

    function _compareStrings (string a, string b) 
    private pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function getVehiclesCount() 
    public view returns (uint) {
        return vehiclesNumberPlate.length;
    }

    function getVehicle
    (
        string _numberPlate
    )
    public view returns (string, string, string, string, string, string, string) {
        bytes32 numberPlateKey = keccak256(abi.encodePacked(_numberPlate));
        Vehicle storage vehicle = vehicles[numberPlateKey];

        return (
            vehicle.numberPlate, vehicle.brand, vehicle.model,
            vehicle.color, vehicle.serialNumber, vehicle.motorNumber, vehicle.reason
        );
    }

    function addVehicle
    (
        string _numberPlate, string _brand, string _model,
        string _color, string _serialNumber, string _motorNumber, string _reason//,
        //string[] _photos, string[] _documents, VehicleOwner[] _owners
    )
    public onlyEmployee {
        bytes32 numberPlateKey = keccak256(abi.encodePacked(_numberPlate));
        require(_compareStrings(vehicles[numberPlateKey].numberPlate, ""), "The vehicle is already registered.");

        Vehicle storage vehicle = vehicles[numberPlateKey];
        vehicle.numberPlate = _numberPlate;
        vehicle.brand = _brand;
        vehicle.model = _model;

        vehicle.color = _color;
        vehicle.serialNumber = _serialNumber;
        vehicle.motorNumber = _motorNumber;
        vehicle.reason = _reason;

        //vehicle.photos = _photos;
        //vehicle.documents = _documents;
        //vehicle.owners = _owners;
        vehicle.employeeAddress = msg.sender;

        vehiclesNumberPlate.push(numberPlateKey);
    }


}