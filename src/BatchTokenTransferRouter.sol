// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPermit2 {
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
    function permitTransferFrom(
        PermitBatchTransferFrom calldata permit,
        SignatureTransferDetails[] calldata transferDetails,
        address owner,
        bytes calldata signature
    ) external;
}

contract BatchTokenTransferRouter {
    address public constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    error LengthMismatch();

    function batchTransfer(
        address[] calldata tokens,
        uint256[] calldata amounts,
        address owner,
        address recipient,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external {
        uint256 length = tokens.length;
        if (length != amounts.length) revert LengthMismatch();

        IPermit2.TokenPermissions[] memory permitted = new IPermit2.TokenPermissions[](length);
        IPermit2.SignatureTransferDetails[] memory transferDetails = new IPermit2.SignatureTransferDetails[](length);

        for (uint256 i = 0; i < length; i++) {
            permitted[i] = IPermit2.TokenPermissions({
                token: tokens[i],
                amount: amounts[i]
            });

            transferDetails[i] = IPermit2.SignatureTransferDetails({
                to: recipient,
                requestedAmount: amounts[i]
            });
        }

        IPermit2.PermitBatchTransferFrom memory permitBatch = IPermit2.PermitBatchTransferFrom({
            permitted: permitted,
            spender: address(this),
            nonce: nonce,
            deadline: deadline
        });

        IPermit2(PERMIT2).permitTransferFrom(
            permitBatch,
            transferDetails,
            owner,
            signature
        );
    }
}
