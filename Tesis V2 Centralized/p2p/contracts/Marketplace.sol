// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
//this is the contract p2pET Descentralized
contract Marketplace {
    address public owner;
    /* string public name; */
    uint public productCount = 0;
    uint public productCount_buyer = 0;
    mapping(uint => Product) public products;
    mapping(uint => ProductBuyer) public products_buyer;

    struct Product {
        uint id;
        //string name;
        uint price;
        string energy;
        address payable owner;
        bool purchased;
    }

    struct ProductBuyer{
        uint id;
        uint price;
        string energy;
        address payable owner;
    }

    event ProductCreated(
        uint id,
        uint price,
        string energy,
        address payable owner,
        bool purchased
    );

    event ProductPurchased(
        uint id,
        uint price,
        string energy,
        address payable owner,
        bool purchased
    );

    constructor() {
        /* name = "Dapp University Marketplace"; */
        owner = msg.sender;
    }

    function createProduct(uint _price, string memory _energy) public {
        // Requiere un nombre válido
        //require(bytes(_name).length > 0, "Product name cannot be empty");
        // Requiere un precio válido
        require(_price > 0, "Product price must be greater than zero");
        // Requiere valor de energia valido
        require(bytes(_energy).length > 0, "Energy must be greater than zero");
        // Incrementa el contador de productos
        productCount++;
        // Crea el producto
        products[productCount] = Product(
            productCount, _price, _energy, payable(msg.sender), false
        );
        // Dispara el evento de creación de producto
        emit ProductCreated(
            productCount,
            _price, _energy, payable(msg.sender), false
        );
    }

    function createProduct_buyer(uint _price, string memory _energy) public {
        // Require a valid price
        require(_price > 0);
        // Require a valid energy value
        require(bytes(_energy).length > 0);
        // Increment product count
        productCount_buyer++;
        // Create the product
        products_buyer[productCount_buyer] = ProductBuyer(
            productCount_buyer,
            _price,
            _energy,
            payable(msg.sender)
        );
        // Trigger an event
        emit ProductCreated(
            productCount_buyer,
            
            _price,
            _energy,
            payable(msg.sender),
            false
        );
    }

    function purchaseProduct(uint _id) public payable {
        // Obtiene el producto
        Product memory _product = products[_id];
        // Obtiene al vendedor
        address payable _seller = _product.owner;
        // Asegura que el producto tenga un ID válido
        require(_product.id > 0 && _product.id <= productCount, "Invalid product ID");
        // Requiere que haya suficiente Ether en la transacción
        require(msg.value >= _product.price, "Not enough Ether to cover the product price");
        // Asegura que el producto no haya sido comprado
        require(!_product.purchased, "Product has already been purchased");
        // Requiere que el comprador no sea el vendedor
        require(_seller != msg.sender, "Buyer cannot be the seller");
        // Transfiere la propiedad al comprador
        _product.owner = payable(msg.sender);
        // Marca como comprado
        _product.purchased = true;
        // Actualiza el producto
        products[_id] = _product;
        // Paga al vendedor transfiriéndole Ether
        (bool success, ) = _seller.call{value: msg.value}("");
        require(success, "Transfer failed.");
        // Dispara el evento de compra del producto
        emit ProductPurchased(
            _id, _product.price, 
            _product.energy, payable(msg.sender), true);
    }
}

