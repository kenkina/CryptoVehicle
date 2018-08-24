// Include web3 library so we can query accounts.
const Web3 = require('web3')
// Instantiate new web3 object pointing toward an Ethereum node.
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"))

const Authorizable = artifacts.require("Authorizable");

contract('Authorizable', async (accounts) => {

    const ownerAddress      = accounts[0]; //"0x8d86e76972ca9f18a489350139bd729872b632b8";
    const adminAddress      = accounts[1]; //"0xb2640918b9fe9d2cd78c92ef23e74b27f47fdea8";
    const employeeAddress   = accounts[2]; //"0xb0e7fee775f8a2dcdf6b277ebfa436ea283f02ae";

    it("Zero employees", async () => {
        let instance = await Authorizable.deployed();
        let count = await instance.getEmployeesCount.call();
        assert.equal(count, 0);
    })
    
    it("Set a administrator with owner account", async () => {
        let instance = await Authorizable.deployed();
        
        let _toAdd  = adminAddress;
        let _dni    = "69925152";
        let _name   = "Ken Kina Admin";

        await instance.setAdministrator(
            _toAdd, web3.utils.utf8ToHex(_dni), web3.utils.utf8ToHex(_name),
            { from: ownerAddress }
        );

        let count = await instance.getEmployeesCount.call();
        assert.equal(count, 1);

        let administrator = {};
        [
            administrator.dni, administrator.name,
            administrator.isAdministrator, administrator.isEmployee
        ] = await instance.getEmployee.call(adminAddress);

        assert.equal(web3.utils.hexToUtf8(administrator.dni), _dni);
        assert.equal(web3.utils.hexToUtf8(administrator.name), _name);
        assert.equal(administrator.isAdministrator, true);
        assert.equal(administrator.isEmployee, true);
    });

    it("Set a employee with admininstrator account", async () => {
        let instance = await Authorizable.deployed();
        
        let _toAdd  = employeeAddress;
        let _dni    = "69925153";
        let _name   = "Ken Kina Employee";

        await instance.setEmployee(
            _toAdd, web3.utils.utf8ToHex(_dni), web3.utils.utf8ToHex(_name),
            { from: adminAddress }
        );

        let count = await instance.getEmployeesCount.call();
        assert.equal(count, 2);

        let employee = {};
        [
            employee.dni, employee.name, employee.isAdministrator, employee.isEmployee
        ] = await instance.getEmployee.call(employeeAddress);

        assert.equal(web3.utils.hexToUtf8(employee.dni), _dni);
        assert.equal(web3.utils.hexToUtf8(employee.name), _name);
        assert.equal(employee.isAdministrator, false);
        assert.equal(employee.isEmployee, true);
    });

    it("Remove a employee", async () => {
        let instance = await Authorizable.deployed();
        
        let _toRemove  = employeeAddress;
        let _dni    = "69925153";
        let _name   = "Ken Kina Employee";

        await instance.removeEmployee(
            _toRemove,
            { from: adminAddress }
        );

        let count = await instance.getEmployeesCount.call();
        assert.equal(count, 2);

        let employee = {};
        [
            employee.dni, employee.name, employee.isAdministrator, employee.isEmployee
        ] = await instance.getEmployee.call(employeeAddress);

        assert.equal(web3.utils.hexToUtf8(employee.dni), _dni);
        assert.equal(web3.utils.hexToUtf8(employee.name), _name);
        assert.equal(employee.isAdministrator, false);
        assert.equal(employee.isEmployee, false);
    });

    it("Remove a administrator", async () => {
        let instance = await Authorizable.deployed();
        
        let _toRemove  = adminAddress;
        let _dni    = "69925152";
        let _name   = "Ken Kina Admin";

        await instance.removeAdministrator(
            _toRemove,
            { from: ownerAddress }
        );

        let count = await instance.getEmployeesCount.call();
        assert.equal(count, 2);

        let administrator = {};
        [
            administrator.dni, administrator.name,
            administrator.isAdministrator, administrator.isEmployee
        ] = await instance.getEmployee.call(adminAddress);

        assert.equal(web3.utils.hexToUtf8(administrator.dni), _dni);
        assert.equal(web3.utils.hexToUtf8(administrator.name), _name);
        assert.equal(administrator.isAdministrator, false);
        assert.equal(administrator.isEmployee, true);
    });
    

})