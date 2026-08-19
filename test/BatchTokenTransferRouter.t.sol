// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BatchTokenTransferRouter.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    // No bool return: real mainnet USDT doesn't return one, unlike standard ERC20
    // forge-lint: disable-next-line(incorrect-erc20-interface)
    function approve(address spender, uint256 amount) external;
}

interface Permit2Like {
    struct TokenPermissions {
        address token;
        uint256 amount;
    }

    struct PermitBatchTransferFrom {
        TokenPermissions[] permitted;
        address spender;
        uint256 nonce;
        uint256 deadline;
    }

    struct SignatureTransferDetails {
        address to;
        uint256 requestedAmount;
    }
}

contract MockERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    string public name;
    string public symbol;
    uint8 public decimals;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "allowance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract MockPermit2 {
    address public immutable expectedRouter;

    constructor(address _expectedRouter) {
        expectedRouter = _expectedRouter;
    }

    function permitTransferFrom(
        Permit2Like.PermitBatchTransferFrom calldata permit,
        Permit2Like.SignatureTransferDetails[] calldata transferDetails,
        address owner,
        bytes calldata signature
    ) external {
        require(permit.spender == expectedRouter, "wrong spender");
        require(signature.length > 0, "empty signature");
        require(permit.deadline >= block.timestamp, "expired");

        for (uint256 i = 0; i < permit.permitted.length; ++i) {
            require(permit.permitted[i].amount == transferDetails[i].requestedAmount, "amount mismatch");
            MockERC20 token = MockERC20(permit.permitted[i].token);
            require(token.allowance(owner, address(this)) >= permit.permitted[i].amount, "token allowance");
            token.transferFrom(owner, transferDetails[i].to, transferDetails[i].requestedAmount);
        }
    }
}

contract BatchTokenTransferRouterTest is Test {
    BatchTokenTransferRouter public router;

    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    MockERC20 tokenA;
    MockERC20 tokenB;

    uint256 userPrivateKey;
    address user;
    address recipient;

    function setUp() public {
        userPrivateKey = 0xA11CE;
        user = vm.addr(userPrivateKey);
        recipient = address(0x2222);

        router = new BatchTokenTransferRouter();

        tokenA = new MockERC20("MockUSD Coin", "mUSDC", 6);
        tokenB = new MockERC20("MockTether", "mUSDT", 6);

        tokenA.mint(user, 1000 * 1e6);
        tokenB.mint(user, 1000 * 1e6);

        vm.prank(user);
        tokenA.approve(PERMIT2, type(uint256).max);

        vm.prank(user);
        tokenB.approve(PERMIT2, type(uint256).max);

        MockPermit2 mockPermit2 = new MockPermit2(address(router));
        vm.etch(PERMIT2, address(mockPermit2).code);
    }

    function test_BatchTransferTwoTokens() public {
        address[] memory tokens = new address[](2);
        tokens[0] = address(tokenA);
        tokens[1] = address(tokenB);

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100 * 1e6;
        amounts[1] = 200 * 1e6;

        uint256 nonce = 1;
        uint256 deadline = block.timestamp + 1000;

        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)"),
                keccak256("Permit2"),
                block.chainid,
                PERMIT2
            )
        );

        bytes32 tokenPermissionsHash0 = keccak256(abi.encode(keccak256("TokenPermissions(address token,uint256 amount)"), address(tokenA), 100 * 1e6));
        bytes32 tokenPermissionsHash1 = keccak256(abi.encode(keccak256("TokenPermissions(address token,uint256 amount)"), address(tokenB), 200 * 1e6));

        bytes32 permittedDataHash = keccak256(abi.encodePacked(tokenPermissionsHash0, tokenPermissionsHash1));

        bytes32 permitBatchTransferFromHash = keccak256(
            abi.encode(
                keccak256("PermitBatchTransferFrom(TokenPermissions[] permitted,address spender,uint256 nonce,uint256 deadline)TokenPermissions(address token,uint256 amount)"),
                permittedDataHash,
                address(router),
                nonce,
                deadline
            )
        );

        bytes32 typedDataHash = keccak256(abi.encodePacked("\x19\x01", domainSeparator, permitBatchTransferFromHash));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(userPrivateKey, typedDataHash);
        bytes memory mockSignature = abi.encodePacked(r, s, v);

        vm.prank(user);
        router.batchTransfer(tokens, amounts, recipient, nonce, deadline, mockSignature);

        assertEq(tokenA.balanceOf(recipient), 100 * 1e6);
        assertEq(tokenB.balanceOf(recipient), 200 * 1e6);
    }
}

