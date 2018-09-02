import {Table, Grid, Button, Form } from 'react-bootstrap';
import React, { Component } from 'react'
//import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import VehicleFactoryContract from '../build/contracts/VehicleFactory.json'
import getWeb3 from './utils/getWeb3'
import ipfs from './ipfs';

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'


class TdList extends Component {
  render() {
    return(
      <table>
        <tbody>
          {this.props.array.map((item, i) => {
            if(item !== "") {
              return (
                <tr key={item + i}>
                  <td>{this.props.web3.toAscii(item)}</td>
                </tr>
              );
            } else {
              return (null);
            }
          })}
        </tbody>
      </table>
    );
  }
}

class TdLinkList extends Component {
  render() {
    return(
      <table>
        <tbody>
          {this.props.array.split("///").map((item, i) => {
            if(item !== "") {
              return (
                <tr key={item + i}>
                  <td> <a href={'https://gateway.ipfs.io/ipfs//' + item} target="_blank"> {this.props.text} </a> </td>
                </tr>
              );
            } else {
              return (null);
            }
          })}
        </tbody>
      </table>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      vehicleFactoryInstance: null,
      web3: null,
      operation: {
        status: '',           // onProcessing, onPending, onValidation, onError
        message: ''           // Custom message
      },
      vehiclesQuantity: 0,
      vehicles: [],
      vehiclesDetail: [],
      vehicle: {
        numberPlate: '',
        brand: '',
        model: '',
        photos: ''
      },
      ipfs: {
        buffer: ''
      }
    }

    this.componentWillMount = this.componentWillMount.bind(this);
    this.handleNumberPlateChange = this.handleNumberPlateChange.bind(this);
    this.handleRegisterVehicle = this.handleRegisterVehicle.bind(this);
    this.handleUpdateVehiclePhotos = this.handleUpdateVehiclePhotos.bind(this);
    this.handleUpdateVehicleOwner = this.handleUpdateVehicleOwner.bind(this);
  }

  componentWillMount = async() => {
    let results = await getWeb3
    .catch(() => {
      console.log('Error finding web3.')
      this.setState({ 
        operation: {
          status: "onError",
          message: "Ha ocurrido un error al buscar el web3."
        }
      });
    });

    this.setState({ web3: results.web3 });

    await this.initContracts();
    await this.manageVehicles();
    //await this.getHistocalData();
  }

  initContracts = async() => {
    const contract = require('truffle-contract');
    const vehicleFactory = contract(VehicleFactoryContract);
    vehicleFactory.setProvider(this.state.web3.currentProvider);
    const vehicleFactoryInstance = await vehicleFactory.deployed();
    this.setState({ vehicleFactoryInstance: vehicleFactoryInstance });

    console.log(await vehicleFactoryInstance.contains("anitalavalatina", "lava"));
    console.log(await vehicleFactoryInstance.contains("anitalavalatina", "anita"));
    console.log(await vehicleFactoryInstance.contains("anitalavalatina", "ana"));
    console.log(await vehicleFactoryInstance.contains("anitalavalatina", "tina"));


    let _numberPlate = "";//this.state.vehicle.numberPlate + "dd";
    let _brand = "";
    let _model = "";
    let _color = "";

    console.log("getVehiclesFilteredWithContains", await vehicleFactoryInstance.getVehiclesFilteredWithContains(
      _numberPlate, 
      _brand, _model,
      _color
    ));
  }

  elementsToHex = (_asciiArray) => {
    return _asciiArray.map((e) => {
      return this.state.web3.fromAscii(e);
    });
  }

  validateMaxLength = (array, maxLength = 32) => {
    return array.map((e) => {
      return e.length <= maxLength;
    });
  }

  execGetVehicles = async() => {
    const vehicleFactoryInstance = this.state.vehicleFactoryInstance;
    console.log("--- Listar ---");

    try {
      const vehicles = await vehicleFactoryInstance.getVehicles.call();
      this.setState({ vehicles: vehicles });
    } catch (e) {
      this.setState({
        operation: {
          status: "onError",
          message: "Ha ocurrido un error al obtener los vehículos."
        }
      });
    }
  }

  execGetVehiclesFiltered = async(
    _numberPlate, _brand, _model, 
    _color
  ) => {
    const web3 = this.state.web3;
    const vehicleFactoryInstance = this.state.vehicleFactoryInstance;
    console.log("--- Filtrar ---");

    try {
      let vehicles = await vehicleFactoryInstance.getVehiclesFiltered(
        web3.fromAscii(_numberPlate), _brand, _model,
        _color
      );
      
      vehicles = vehicles.filter((e) => {
        return e !== "0x0000000000000000000000000000000000000000000000000000000000000000";
      });

      this.setState({ vehicles: vehicles });
    } catch (e) {
      this.setState({
        operation: {
          status: "onError",
          message: "Ha ocurrido un error al filtrar los vehículos."
        }
      });
    }
  }

  execGetVehicleDetail = async(_numberPlate) => {
    const vehicleFactoryInstance = this.state.vehicleFactoryInstance;

    let vehicle = await vehicleFactoryInstance.getVehicle(_numberPlate);
    let vehicleDetail = await vehicleFactoryInstance.getVehicleDetail(_numberPlate);
    vehicle.push(...vehicleDetail);
    return vehicle;
  }

  execRegisterVehicle = async(
    _numberPlate, _brand, _model, 
    _color, _serialNumber, _motorNumber, _reason,
    _photos, _documents, _ownersId, _ownersNames,
    _userAddress
  ) => {
    const web3 = this.state.web3;
    const vehicleFactoryInstance = this.state.vehicleFactoryInstance;    

    let exists = await vehicleFactoryInstance.vehicleExists(web3.fromAscii(_numberPlate));
    if(exists) {
      this.setState({ 
        operation: {
          status: "onValidation",
          message: "Este vehículo ya está registrado."
        }
      });
      return false;
    }

    exists = await vehicleFactoryInstance.serialNumberExists(web3.fromAscii(_serialNumber));
    if(exists) {
      this.setState({ 
        operation: {
          status: "onValidation",
          message: "Este número de serie ya está registrado."
        }
      });
      return false;
    }

    exists = await vehicleFactoryInstance.motorNumberExists(web3.fromAscii(_motorNumber));
    if(exists) {
      this.setState({ 
        operation: {
          status: "onValidation",
          message: "Este número de motor ya está registrado."
        }
      });
      return false;
    }

    _photos = "QmfSPakJG6BgQkRmDusF2t5mzz5MYEJgtz6bTdZh3ac6jm";
    _documents = "QmfSPakJG6BgQkRmDusF2t5mzz5MYEJgtz6bTdZh3ac6jm";
    _ownersId = this.elementsToHex(_ownersId);
    _ownersNames = this.elementsToHex(_ownersNames);

    let wasVehicleAdded = await vehicleFactoryInstance.registerVehicle(
      web3.fromAscii(_numberPlate), web3.fromAscii(_brand), web3.fromAscii(_model),
      web3.fromAscii(_color), web3.fromAscii(_serialNumber), web3.fromAscii(_motorNumber), web3.fromAscii(_reason),
      _photos, _documents, _ownersId, _ownersNames,
        {from: _userAddress}
    );

    if(wasVehicleAdded) {
      this.setState({ 
        operation: {
          status: "onPending",
          message: "Procesando el registro del vehículo."
        }
      });
    } else {
      this.setState({ 
        operation: {
          status: "onError",
          message: "Ocurrió un error al registrar el vehículo."
        }
      });
    }

    return wasVehicleAdded;
  }

  execUpdateVehiclePhotos = async(
    _numberPlate, _photos,
    _userAddress
  ) => {
    const web3 = this.state.web3;
    const vehicleFactoryInstance = this.state.vehicleFactoryInstance;    

    const exists = await vehicleFactoryInstance.vehicleExists(web3.fromAscii(_numberPlate));
    if(!exists) {
      this.setState({ 
        operation: {
          status: "onValidation",
          message: "Este vehículo no está registrado."
        }
      });
      return false;
    }

    //_photos = "QmfSPakJG6BgQkRmDusF2t5mzz5MYEJgtz6bTdZh3ac6jm///QmfSPakJG6BgQkRmDusF2t5mzz5MYEJgtz6bTdZh3ac6jm///QmfSPakJG6BgQkRmDusF2t5mzz5MYEJgtz6bTdZh3ac6jm";

    let werePhotosSet = await vehicleFactoryInstance.updateVehiclePhotos(
      web3.fromAscii(_numberPlate), _photos,
        {from: _userAddress}
    );

    if(werePhotosSet) {
      this.setState({ 
        operation: {
          status: "onPending",
          message: "Procesando la actualización de los datos del vehículo."
        }
      });
    } else {
      this.setState({ 
        operation: {
          status: "onError",
          message: "Ocurrió un error al actualizar los datos del vehículo."
        }
      });
    }
  }


  manageVehicles = async(election = 1) => {
    const vehicleFactoryInstance = this.state.vehicleFactoryInstance;

    const vehicleCount = await vehicleFactoryInstance.getVehiclesCount.call();
    this.setState({ vehiclesQuantity: vehicleCount.c[0] });

    if (election === 1) {
      await this.execGetVehicles();
    } else {
      let _numberPlate = this.state.vehicle.numberPlate;
      let _brand = "TOYOTAD";
      let _model = "HILUX SURF SSR G WIDED";
      let _color = "DORADOD";

      await this.execGetVehiclesFiltered(
        _numberPlate, _brand, _model, 
        _color);
    }

    await this.manageVehiclesDetail();
  }

  manageVehiclesDetail = async() => {
    let promises = [];
    const vehicles = this.state.vehicles;

    try {
      vehicles.map((e) => {
        return promises.push(this.execGetVehicleDetail(e));
      });
  
      const vehiclesDetail = await Promise.all(promises);
      console.log(vehiclesDetail);
      this.setState({ vehiclesDetail: vehiclesDetail });
    } catch (e) {
      this.setState({ 
        operation: {
          status: "onError",
          message: "Ha ocurrido un error al obtener el detalle de los vehículos."
        }
      });
    }
  }

  
  // Failed :(
  getHistocalData = async() => {
    const web3 = this.state.web3;
    const vehicleFactoryInstance = this.state.vehicleFactoryInstance;
    console.log(vehicleFactoryInstance.address);

    const contractAddress = vehicleFactoryInstance.address;
    web3.eth.filter({
      to: contractAddress
    }).get(function (err, result) {
      console.log(err, result);
    });
  }

  handleNumberPlateChange = async(event) => {
    this.setState({ 
      vehicle: {
        numberPlate: event.target.value
      }
     });
  }

  handleRegisterVehicle = async() => {
    const web3 = this.state.web3;

    const accounts = web3.eth.accounts;
    if(!accounts || !accounts[0]) {
      console.log("There is no account.");
      this.setState({ 
        operation: {
          status: "onError",
          message: "No se ha encontrado ninguna cuenta."
        }
      });
      return;
    }

    let _numberPlate = this.state.vehicle.numberPlate;
    let _brand = "TOYOTA";
    let _model = "HILUX SURF SSR G WIDE";
    let _color = "DORADO";
    let _serialNumber = "KZN1859025037" + _numberPlate;
    let _motorNumber = "1KZ0558403" + _numberPlate;
    let _reason = "Registro de nuevo vehículo";
    let _photos = ["Photo1", "Photo2"];
    let _documents = ["Doc1", "Doc2"];
    let _ownersId = ["Id1", "Id2"];
    let _ownersNames = ["Name1", "Name2"];
    let _userAddress = accounts[0];

    await this.execRegisterVehicle(
      _numberPlate, _brand, _model, 
      _color, _serialNumber, _motorNumber, _reason,
      _photos, _documents, _ownersId, _ownersNames,
      _userAddress
    );

    setTimeout(function() {
      this.manageVehicles();
    }.bind(this), 5000);
  } 

  handleUpdateVehiclePhotos = async(_numberPlate) => {
    const web3 = this.state.web3;

    const accounts = web3.eth.accounts;
    if(!accounts || !accounts[0]) {
      console.log("There is no account.");
      return;
    }

    let _photos = this.state.vehicle.photos;
    let _userAddress = accounts[0];

    await this.execUpdateVehiclePhotos(
      _numberPlate, _photos,
      _userAddress
    );

    setTimeout(function() {
      this.manageVehicles();
    }.bind(this), 5000);
  }

  handleUpdateVehicleOwner = async(_numberPlate) => {
    const web3 = this.state.web3;
    const vehicleFactoryInstance = this.state.vehicleFactoryInstance;

    const accounts = web3.eth.accounts;
    if(!accounts || !accounts[0]) {
      console.log("There is no account.");
      this.setState({ 
        operation: {
          status: "onError",
          message: "No se ha encontrado ninguna cuenta."
        }
      });
      return;
    }

    const exists = await vehicleFactoryInstance.vehicleExists(web3.fromAscii(_numberPlate));
    if(!exists) {
      console.log("This car does not exists.");
      return;
    }

    let _ownersId = ["DNI2", "DNI3", _numberPlate];
    let _ownersNames = ["John Doe2", "John Does3", _numberPlate];
    
    _ownersId = this.elementsToHex(_ownersId);
    _ownersNames = this.elementsToHex(_ownersNames);

    console.log(_ownersId, _ownersNames);

    let wereOwnerSet = await vehicleFactoryInstance.updateVehicleOwner(
      web3.fromAscii(_numberPlate), _ownersId, _ownersNames,
        {from: accounts[0]}
    );
    
    if(!wereOwnerSet) {
      console.log("Ocurrió un error al asignar fotos al vehículo.");
      return;
    }

    setTimeout(function() {
      this.manageVehicles();
    }.bind(this), 5000);
  }

  captureFile = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files[0];
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => this.convertToBuffer(reader)  ;  
  }

  convertToBuffer = async(reader) => {
    const buffer = await Buffer.from(reader.result);
    this.setState({ 
      ipfs: {
        buffer
      }
     });
  }

  onSubmit = async (event) => {
    event.preventDefault();

    await ipfs.add(this.state.ipfs.buffer, (err, ipfsHash) => {
      console.log(err, ipfsHash);

      let photos;
      console.log(photos);
      if(this.state.vehicle.photos === "") {
        photos = ipfsHash[0].hash;
      } else {
        photos = this.state.vehicle.photos + "///" + ipfsHash[0].hash;
      }
      
      this.setState({ 
        vehicle: {
          photos
        }
       });
    })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Cryptovehicle</a>
            <a href="#" className="pure-menu-heading pure-menu-link">{this.state.operation.status}</a>
            <a href="#" className="pure-menu-heading pure-menu-link">{this.state.operation.message}</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <div>
                <h1>Register a vehicle</h1>
                <p>The quantity is: {this.state.vehiclesQuantity}</p>
              </div>
              <div>
                <label> Plate Number: </label>
                <input type="text" value={this.state.vehicle.numberPlate} onChange={this.handleNumberPlateChange} />
              </div>
              <div>
                <button onClick={() => this.handleRegisterVehicle()}>Register</button>
                <button onClick={() => this.manageVehicles(2)}>Find</button>              
              </div>
            </div>
            <Grid>
              <input 
                type="file"
                onChange={this.captureFile} />
              <button onClick={this.onSubmit}> 
                Send it 
              </button>            
            </Grid>
            <br />
            <br />
            <div className="pure-g">
              <div className="pure-u-1-1">
                <Table>
                  <tbody>
                    {this.state.vehicles.map((numberPlate) => {
                      return (
                        <tr key={numberPlate}>
                          <td>{numberPlate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                <table>
                  <thead>
                    <tr>
                      <td>Num. plate</td>
                      <td>Brand</td>
                      <td>Model</td>
                      <td>Color</td>
                      <td>Serial number</td>
                      <td>Motor number</td>
                      <td>Last reason</td>
                      <td>Photos</td>
                      <td>Docs</td>
                      <td colSpan={2}>Owner</td>
                      <td>Empl.</td>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      this.state.vehiclesDetail.map((vehicle) => {
                        return (
                          <tr key={vehicle[0]}>
                            <td>{this.state.web3.toAscii(vehicle[0])}</td>
                            <td>{this.state.web3.toAscii(vehicle[1])}</td>
                            <td>{this.state.web3.toAscii(vehicle[2])}</td>
                            <td>{this.state.web3.toAscii(vehicle[3])}</td>
                            <td>{this.state.web3.toAscii(vehicle[4])}</td>
                            <td>{this.state.web3.toAscii(vehicle[5])}</td>
                            <td>{this.state.web3.toAscii(vehicle[6])}</td>
                            <td> <TdLinkList web3={this.state.web3} array={vehicle[7]} text="Photo" /> </td>
                            <td> <TdLinkList web3={this.state.web3} array={vehicle[8]} text="Doc" /> </td>
                            <td> <TdList web3={this.state.web3} array={vehicle[9]} /> </td>
                            <td> <TdList web3={this.state.web3} array={vehicle[10]} /> </td>
                            <td>{vehicle[11]}</td>
                            <td>
                              <button onClick={() => this.handleUpdateVehiclePhotos(this.state.web3.toAscii(vehicle[0]))}>P++</button>
                              <button onClick={() => this.handleUpdateVehicleOwner(this.state.web3.toAscii(vehicle[0]))}>O++</button>
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
