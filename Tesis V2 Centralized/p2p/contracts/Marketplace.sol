// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace {
    address public owner;          // Admin del contrato
    address public coordinator;    // Coordinator autorizado

    uint public productCount = 0;
    uint public productCount_buyer = 0;

    mapping(uint => Product) public products;
    mapping(uint => ProductBuyer) public products_buyer;

    enum Status { Pending, Approved, Rejected }

    struct Product {
        uint id;
        uint price;
        string energy;
        address payable owner;
        bool purchased;
        Status approvalStatus;
    }

    struct ProductBuyer {
        uint id;
        uint price;
        string energy;
        address payable owner;
        bool fulfilled;
        Status approvalStatus;
    }

    event ProductCreated(
        uint id, 
        uint price, 
        string energy, 
        address payable owner, 
        bool purchased
    );

    event ProductApproved(
        uint id, 
        string direction
    ); // direction: "sell" o "buy"

    event ProductRejected(
        uint id, 
        string direction
    );

    event ProductPurchased(
        uint id, 
        uint price, 
        string energy, 
        address payable owner, 
        bool purchased
    );

    event ProductSoldToBuyer(
        uint id, 
        uint price, 
        string energy, 
        address payable buyer, 
        address payable seller
    );

    constructor() {
        owner = msg.sender;
        coordinator = msg.sender; // El deployer es también el coordinador por defecto
    }

    modifier onlyCoordinator() {
        require(msg.sender == coordinator, "Only coordinator can perform this action");
        _;
    }

    function setCoordinator(address _coordinator) public {
        require(msg.sender == owner, "Only owner can set the coordinator");
        coordinator = _coordinator;
    }

    function createProduct(uint _price, string memory _energy) public {
        require(_price > 0, "Product price must be greater than zero");
        require(bytes(_energy).length > 0, "Energy must be specified");

        productCount++;
        products[productCount] = Product(productCount, _price, _energy, payable(msg.sender), false, Status.Pending);

        emit ProductCreated(productCount, _price, _energy, payable(msg.sender), false);
    }

    function createProduct_buyer(uint _price, string memory _energy) public {
        require(_price > 0, "Price must be greater than zero");
        require(bytes(_energy).length > 0, "Energy must be specified");

        productCount_buyer++;
        products_buyer[productCount_buyer] = ProductBuyer(productCount_buyer, _price, _energy, payable(msg.sender), false, Status.Pending);

        emit ProductCreated(productCount_buyer, _price, _energy, payable(msg.sender), false);
    }

    function approveProduct(uint _id) public onlyCoordinator {
        require(_id > 0 && _id <= productCount, "Invalid product ID");
        products[_id].approvalStatus = Status.Approved;
        emit ProductApproved(_id, "sell");
    }

    function approveBuyerRequest(uint _id) public onlyCoordinator {
        require(_id > 0 && _id <= productCount_buyer, "Invalid buyer request ID");
        products_buyer[_id].approvalStatus = Status.Approved;
        emit ProductApproved(_id, "buy");
    }

    function rejectProduct(uint _id) public onlyCoordinator {
        require(_id > 0 && _id <= productCount, "Invalid product ID");
        products[_id].approvalStatus = Status.Rejected;
        emit ProductRejected(_id, "sell");
    }

    function rejectBuyerRequest(uint _id) public onlyCoordinator {
        require(_id > 0 && _id <= productCount_buyer, "Invalid buyer request ID");
        products_buyer[_id].approvalStatus = Status.Rejected;
        emit ProductRejected(_id, "buy");
    }

    function purchaseProduct(uint _id) public payable {
        Product storage _product = products[_id];
        address payable _seller = _product.owner;

        require(_product.approvalStatus == Status.Approved, "Product not approved by coordinator");
        require(!_product.purchased, "Already purchased");
        require(msg.value >= _product.price, "Not enough Ether");
        require(_seller != msg.sender, "Buyer cannot be the seller");

        _product.owner = payable(msg.sender);
        _product.purchased = true;

        (bool success, ) = _seller.call{value: msg.value}("");
        require(success, "Transfer failed");

        emit ProductPurchased(_id, _product.price, _product.energy, payable(msg.sender), true);
    }

    function sellToBuyerRequest(uint _id) public payable {
        ProductBuyer storage _request = products_buyer[_id];

        require(_request.approvalStatus == Status.Approved, "Buyer request not approved");
        require(!_request.fulfilled, "Request already fulfilled");
        require(_request.owner != msg.sender, "Cannot sell to your own request");

        (bool success, ) = _request.owner.call{value: _request.price}("");
        require(success, "Payment failed");

        _request.fulfilled = true;

        emit ProductSoldToBuyer(_id, _request.price, _request.energy, _request.owner, payable(msg.sender));
    }

    function getPendingProducts() public view returns (Product[] memory) {      //productos en venta
        uint pendingCount = 0;
        for (uint i = 1; i <= productCount; i++) {
            if (products[i].approvalStatus == Status.Pending) {
                pendingCount++;
            }
        }

        Product[] memory pendingProducts = new Product[](pendingCount);
        uint index = 0;
        for (uint i = 1; i <= productCount; i++) {
            if (products[i].approvalStatus == Status.Pending) {
                pendingProducts[index] = products[i];
                index++;
            }
        }

        return pendingProducts;
    }

    function getPendingBuyerRequests() public view returns (ProductBuyer[] memory) {
        uint pendingCount = 0;
        for (uint i = 1; i <= productCount_buyer; i++) {
            if (products_buyer[i].approvalStatus == Status.Pending) {
                pendingCount++;
            }
        }

        ProductBuyer[] memory pendingRequests = new ProductBuyer[](pendingCount);
        uint index = 0;
        for (uint i = 1; i <= productCount_buyer; i++) {
            if (products_buyer[i].approvalStatus == Status.Pending) {
                pendingRequests[index] = products_buyer[i];
                index++;
            }
        }

        return pendingRequests;
    }

    //productos aprobados
    function getApprovedProducts() public view returns (Product[] memory) {
        uint approvedCount = 0;
        for (uint i = 1; i <= productCount; i++) {
            if (products[i].approvalStatus == Status.Approved) {
                approvedCount++;
            }
        }

        Product[] memory approvedProducts = new Product[](approvedCount);
        uint index = 0;
        for (uint i = 1; i <= productCount; i++) {
            if (products[i].approvalStatus == Status.Approved) {
                approvedProducts[index] = products[i];
                index++;
            }
        }

        return approvedProducts;
    }

    function getApprovedBuyerRequests() public view returns (ProductBuyer[] memory) {
        uint approvedCount = 0;
        for (uint i = 1; i <= productCount_buyer; i++) {
            if (products_buyer[i].approvalStatus == Status.Approved) {
                approvedCount++;
            }
        }

        ProductBuyer[] memory approvedRequests = new ProductBuyer[](approvedCount);
        uint index = 0;
        for (uint i = 1; i <= productCount_buyer; i++) {
            if (products_buyer[i].approvalStatus == Status.Approved) {
                approvedRequests[index] = products_buyer[i];
                index++;
            }
        }

        return approvedRequests;
    }


}
