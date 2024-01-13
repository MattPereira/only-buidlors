// SPDX-License-Identifier: MIT

// Layout of Contract:
// version
// imports
// errors
// interfaces, libraries, contracts
// Type declarations
// State variables
// Events
// Modifiers
// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// internal & private view & pure functions
// external & public view & pure functions

pragma solidity ^0.8.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_X/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_X/libraries/FunctionsRequest.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

/**
 * Dynamic SVG NFT for Buidl Guidl members only
 * @notice background color changes based on buildCount which is set by chainlink function
 * @notice MemberData.ensName sourced from frontend that queries mainnet ens registry
 */
contract BuidlCountNft is ERC721, FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    /*** Errors ***/
    error UnexpectedRequestID(bytes32 requestId);

    /*** Types ***/
    struct MemberData {
        string ensName;
        uint8 buildCount;
    }

    /*** State Variables ***/
    mapping(address => MemberData) public s_memberToData;
    mapping(address => bool) private s_hasMinted;
    uint256 private s_tokenCounter;
    string private constant s_base64EncodedSvgPrefix =
        "data:image/svg+xml;base64,";
    string private constant s_beginnerColor = "#52525b";
    string private constant s_intermediateColor = "#2563eb";
    string private constant s_expertColor = "#4f46e5";
    // associated with chainlink function
    mapping(bytes32 => address) public s_requestIdToMemberAddress;
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    uint32 public s_gasLimit;
    bytes32 public s_donID;
    string source =
        "const buidlGiudlURL = `https://buidlguidl-v3.appspot.com/builders/${args[0]}`"
        "const apiResponse = await Functions.makeHttpRequest({"
        "  url: buidlGiudlURL,"
        "  method: 'GET',"
        "})"
        "if (apiResponse.error) {"
        "throw Error('request failed');"
        "}"
        "const buildCount = 0;"
        "if(apiResponse.data.builds) {"
        "  buildCount = apiResponse.data.builds.length;"
        "}"
        "return Functions.encodeUint256(buildCount)";

    /*** Events ***/
    event Response(
        bytes32 indexed requestId,
        address indexed member,
        uint256 indexed buildCount,
        bytes response,
        bytes err
    );

    /**
     * @param router address of chainlink router
     * @param donId lookup in chainlink docs per network
     * @param gasLimit max gas that can be spent during response callback function
     */
    constructor(
        address router,
        bytes32 donId,
        uint32 gasLimit
    )
        FunctionsClient(router)
        ConfirmedOwner(msg.sender)
        ERC721("Buidl Counter", "BDLC")
    {
        s_tokenCounter = 0; // first NFT minted has tokenId of 0
        s_donID = donId;
        s_gasLimit = gasLimit;
    }

    /**
     * @notice split encoding of image uri string into two parts to avoid "stack too deep" error caused by huge string concat and encoding in single function
     * @param tokenId looks up owner address to lookup buildCount to determine background color
     */
    function svgToImageURI(
        uint256 tokenId
    ) public view returns (string memory) {
        address ownerAddr = ownerOf(tokenId);

        string memory color;
        if (s_memberToData[ownerAddr].buildCount < 5) {
            color = s_beginnerColor;
        } else if (s_memberToData[ownerAddr].buildCount < 10) {
            color = s_intermediateColor;
        } else {
            color = s_expertColor;
        }
        string memory svgTop = buildSvgTop(color);
        string memory svgBottom = buildSvgBottom(color, tokenId);
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svgTop, svgBottom)))
        );
        return
            string(
                abi.encodePacked(s_base64EncodedSvgPrefix, svgBase64Encoded)
            );
    }

    /**
     *  The top half of the svg that shows above the ens name display
     * @param backgroundColor used to fill background of svg and text of ensName
     */
    function buildSvgTop(
        string memory backgroundColor
    ) private pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<svg width="500" height="375" viewBox="0 0 500 375" font-family="Verdana, Sans" xmlns="http://www.w3.org/2000/svg">',
                    '<rect width="500" height="375" fill="',
                    backgroundColor,
                    '"/>',
                    '<g transform="translate(20, 27) scale(1.15)">',
                    '<path fill="white" d="M63.1218 27.7353V76.2086H42.8441V61.9337C42.8441 55.6618 37.7624 50.5771 31.5185 50.5771C25.2747 50.5771 20.193 55.6618 20.193 61.9337V76.2086H0V27.7353H11.818V34.7392C11.818 37.7366 14.2505 40.1603 17.2345 40.1603C20.2186 40.1603 22.6511 37.7366 22.6511 34.7392V27.7353H40.3781V34.7095C40.3781 37.7069 42.8106 40.1306 45.7947 40.1306C48.7787 40.1306 51.2112 37.7069 51.2112 34.7095V27.7353H63.1218Z"/>',
                    '<path d="M28.7643 2.18495V32.263H34.0339V18.7778C34.0339 18.7778 35.3804 16.0081 40.2893 17.2299C46.7851 18.8468 54.7881 17.7511 59.9257 8.45259C44.3573 13.5802 43.9403 -4.04034 28.7643 2.18495Z" fill="white"/>',
                    "</g>"
                    '<text fill="white" x="97" y="115" font-size="77">BuidlGuidl</text>',
                    '<rect fill="white" x="0" y="160" width="500" height="60"/>'
                )
            );
    }

    /**
     * The bottom half of the svg that shows ensName and buildCount
     * @notice addressString is only used as fallback if ensName is absent
     * @param textColor text color for buildCount number (matches the background color)
     * @param tokenId to get the address of the NFT owner used to lookup dynamic ens name and buildCount
     */
    function buildSvgBottom(
        string memory textColor,
        uint256 tokenId
    ) private view returns (string memory) {
        address ownerAddr = ownerOf(tokenId);
        string memory ensName = s_memberToData[ownerAddr].ensName;
        string memory identity;
        if (bytes(ensName).length == 0) {
            string memory addressString = Strings.toHexString(
                uint256(uint160(ownerAddr)),
                20
            );
            identity = string(
                abi.encodePacked(
                    '<text fill="',
                    textColor,
                    '" x="250" y="197" font-size="18" text-anchor="middle">',
                    addressString,
                    "</text>"
                )
            );
        } else {
            identity = string(
                abi.encodePacked(
                    '<text fill="',
                    textColor,
                    '" x="250" y="205" font-size="45" text-anchor="middle">',
                    ensName,
                    "</text>"
                )
            );
        }

        string memory buildCountString = Strings.toString(
            s_memberToData[ownerAddr].buildCount
        );
        return
            string(
                abi.encodePacked(
                    identity,
                    '<circle fill="white" cx="440" cy="300" r="38" />',
                    '<text  x="440" y="300" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="',
                    textColor,
                    '">',
                    buildCountString,
                    "</text>",
                    '<text fill="white" x="25" y="315" font-size="43" font-weight="bold">Builds Shipped</text>',
                    "</svg>"
                )
            );
    }

    function initMember(string memory _ensName) external {
        s_memberToData[msg.sender] = MemberData({
            ensName: _ensName,
            buildCount: 0
        });
    }

    /** @notice sends request to chainlink node for off chain execution of JS source code
     * @param subscriptionId registered with chainlink (must have added this contract as a consumer)
     * @param args the arguments to pass to the javascript source code
     */
    function sendRequest(
        uint64 subscriptionId,
        string[] calldata args
    ) external returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req._initializeRequestForInlineJavaScript(source); // Initialize the request with JS code
        if (args.length > 0) req._setArgs(args); // Set the arguments for the request
        // Send the request and store the request ID
        s_lastRequestId = _sendRequest(
            req._encodeCBOR(),
            subscriptionId,
            s_gasLimit,
            s_donID
        );
        s_requestIdToMemberAddress[s_lastRequestId] = msg.sender;
        return s_lastRequestId;
    }

    /**
     * @notice Callback function for fulfilling a request
     * @param requestId The ID of the request to fulfill
     * @param response The HTTP response data
     * @param err Any errors from the Functions request
     */
    function _fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId); // Check if request IDs match
        }
        address member = s_requestIdToMemberAddress[requestId];
        uint256 buildCount = abi.decode(response, (uint256));
        s_memberToData[member].buildCount = uint8(buildCount);
        s_lastResponse = response;
        s_lastError = err;

        emit Response(
            requestId,
            member,
            buildCount,
            s_lastResponse,
            s_lastError
        );
    }

    /**
     * 1. send chainlink function request to get member data
     * 2. update state variable mappings with member data
     * 3. mint new NFT
     *
     */
    function minNft() public {
        require(
            !s_hasMinted[msg.sender],
            "This BuidlGuidl member has already minted an NFT"
        );
        _safeMint(msg.sender, s_tokenCounter);
        s_hasMinted[msg.sender] = true;
        s_tokenCounter++;
    }

    /**
     * @dev "ownerOf" inhereted from ERC721 contract
     * @param tokenId used to select background color
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(tokenId < s_tokenCounter, "Token id does not exist.");
        string memory imageURI = svgToImageURI(tokenId);

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name": "',
                                name(),
                                '", "description": "Dynamic SVG NFT that tracks BuidlGuidl member data", "attributes": [{"trait_type": "coolness", "value": "100"}], "image": "',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function getBuidlCount(address _memberAddr) public view returns (uint8) {
        return s_memberToData[_memberAddr].buildCount;
    }
}
