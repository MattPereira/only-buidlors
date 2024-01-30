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
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * Dynamic SVG NFT for Buidl Guidl members only
 * @notice background color changes based on buildCount which is set by chainlink function
 * @notice MemberData.ensName sourced from frontend that queries mainnet ens registry
 */
contract OnlyBuidlorsNft is ERC721, FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    /*** Errors ***/
    error UnexpectedRequestID(bytes32 requestId);

    /*** Types ***/
    enum RarityTier {
        Uncommon,
        Rare,
        Epic,
        Legendary
    }

    struct RarityAttributes {
        string name;
        string hexColor;
    }

    struct MemberData {
        string ensName;
        uint256 buildCount;
    }

    /*** State Variables ***/
    mapping(address => MemberData) public s_memberToData;
    mapping(RarityTier => RarityAttributes) public s_rarityDetails;
    mapping(address => bool) private s_hasMinted;
    uint256 private s_tokenCounter;
    string private constant s_base64EncodedSvgPrefix =
        "data:image/svg+xml;base64,";
    // associated with chainlink function
    mapping(bytes32 => address) public s_requestIdToMemberAddress;
    bytes32 public s_lastRequestId;
    // bytes public s_lastResponse;
    // bytes public s_lastError;
    uint32 public s_gasLimit;
    bytes32 public s_donID;
    string public s_source =
        "const address = args[0];"
        "const apiResponse = await Functions.makeHttpRequest({"
        "url: `https://buidlguidl-v3.appspot.com/builders/${address}`"
        "});"
        "if (apiResponse.error) {"
        "throw Error('request failed');"
        "}"
        "const { data } = apiResponse;"
        "let buildCount = 0;"
        "if(data.builds) {"
        " buildCount = data.builds.length;"
        "}"
        "return Functions.encodeUint256(buildCount);";

    /*** Events ***/
    event Request(
        address indexed member,
        string indexed argsZero,
        bytes32 indexed requestId
    );

    event Response(
        bytes32 indexed requestId,
        address indexed member,
        uint256 indexed buildCount
    );

    event Minted(address indexed member, uint256 indexed tokenId);

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
        ERC721("Only Buidlors", "OBDL")
    {
        s_tokenCounter = 0; // first NFT minted has tokenId of 0
        s_donID = donId;
        s_gasLimit = gasLimit;
        s_rarityDetails[RarityTier.Uncommon] = RarityAttributes(
            "Uncommon",
            "#16a34a"
        );
        s_rarityDetails[RarityTier.Rare] = RarityAttributes("Rare", "#2563eb");
        s_rarityDetails[RarityTier.Epic] = RarityAttributes("Epic", "#9333ea");
        s_rarityDetails[RarityTier.Legendary] = RarityAttributes(
            "Legendary",
            "#ea580c"
        );
    }

    /**
     * @param tokenId used to select background color
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(tokenId < s_tokenCounter, "Token id does not exist.");
        string memory imageURI = svgToImageURI(tokenId);
        uint256 memberBuildCount = s_memberToData[ownerOf(tokenId)].buildCount;

        RarityTier tier;
        if (memberBuildCount < 5) {
            tier = RarityTier.Uncommon;
        } else if (memberBuildCount < 10) {
            tier = RarityTier.Rare;
        } else if (memberBuildCount < 15) {
            tier = RarityTier.Epic;
        } else {
            tier = RarityTier.Legendary;
        }

        RarityAttributes memory rarity = s_rarityDetails[tier];

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name": "',
                                name(),
                                '", "description": "Dynamic SVG NFT that tracks BuidlGuidl member data", "attributes": [{"trait_type": "rarity", "value": "',
                                rarity.name,
                                '"}], "image": "',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    /**
     * @notice split encoding of image uri string into two parts to avoid "stack too deep" error caused by huge string concat and encoding in single function
     * @param tokenId looks up owner address to lookup buildCount to determine background color
     */
    function svgToImageURI(
        uint256 tokenId
    ) public view returns (string memory) {
        address ownerAddr = ownerOf(tokenId);
        uint256 memberBuildCount = s_memberToData[ownerAddr].buildCount;
        RarityTier tier;
        if (memberBuildCount < 5) {
            tier = RarityTier.Uncommon;
        } else if (memberBuildCount < 10) {
            tier = RarityTier.Rare;
        } else if (memberBuildCount < 15) {
            tier = RarityTier.Epic;
        } else {
            tier = RarityTier.Legendary;
        }

        RarityAttributes memory rarity = s_rarityDetails[tier];
        string memory color = rarity.hexColor;
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
                    '<svg width="500" height="333" viewBox="0 0 500 333" font-family="Verdana, Sans" xmlns="http://www.w3.org/2000/svg">',
                    '<rect width="500" height="333" fill="',
                    backgroundColor,
                    '"/>',
                    '<g transform="translate(20, 27) scale(1.15)">',
                    '<path fill="white" d="M63.1218 27.7353V76.2086H42.8441V61.9337C42.8441 55.6618 37.7624 50.5771 31.5185 50.5771C25.2747 50.5771 20.193 55.6618 20.193 61.9337V76.2086H0V27.7353H11.818V34.7392C11.818 37.7366 14.2505 40.1603 17.2345 40.1603C20.2186 40.1603 22.6511 37.7366 22.6511 34.7392V27.7353H40.3781V34.7095C40.3781 37.7069 42.8106 40.1306 45.7947 40.1306C48.7787 40.1306 51.2112 37.7069 51.2112 34.7095V27.7353H63.1218Z"/>',
                    '<path d="M28.7643 2.18495V32.263H34.0339V18.7778C34.0339 18.7778 35.3804 16.0081 40.2893 17.2299C46.7851 18.8468 54.7881 17.7511 59.9257 8.45259C44.3573 13.5802 43.9403 -4.04034 28.7643 2.18495Z" fill="white"/>',
                    "</g>"
                    '<text fill="white" x="97" y="115" font-size="77">BuidlGuidl</text>',
                    '<rect fill="white" x="0" y="150" width="500" height="60"/>'
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
                    '" x="250" y="188" font-size="18" text-anchor="middle">',
                    addressString,
                    "</text>"
                )
            );
        } else {
            identity = string(
                abi.encodePacked(
                    '<text fill="',
                    textColor,
                    '" x="250" y="195" font-size="45" text-anchor="middle">',
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
                    '<circle fill="white" cx="440" cy="275" r="38" />',
                    '<text  x="440" y="275" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="',
                    textColor,
                    '">',
                    buildCountString,
                    "</text>",
                    '<text fill="white" x="25" y="290" font-size="43" font-weight="bold">Builds Shipped</text>',
                    "</svg>"
                )
            );
    }

    /** @notice sends request to chainlink node for off chain execution of JS source code
     * @param subscriptionId registered with chainlink (must have added this contract as a consumer)
     * @param args the arguments to pass to the javascript source code
     * @param ensName ens name resolved by frontend and passed in as an argument for updating the svg
     */
    function sendRequest(
        uint64 subscriptionId,
        string[] calldata args,
        string memory ensName
    ) external returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(s_source); // Initialize the request with JS code
        if (args.length > 0) req.setArgs(args); // Set the arguments for the request
        // Send the request and store the request ID
        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            s_gasLimit,
            s_donID
        );
        s_requestIdToMemberAddress[s_lastRequestId] = msg.sender;
        s_memberToData[msg.sender].ensName = ensName;
        emit Request(msg.sender, args[0], s_lastRequestId);
        return s_lastRequestId;
    }

    /**
     * @notice Callback function for fulfilling a request
     * @param requestId The ID of the request to fulfill
     * @param response The HTTP response data
     * @ param err Any errors from the Functions request
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory /* err */
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId); // Check if request IDs match
        }
        address member = s_requestIdToMemberAddress[requestId];
        uint256 buildCount = abi.decode(response, (uint256));
        s_memberToData[member].buildCount = buildCount;
        emit Response(requestId, member, buildCount);
    }

    /**
     * May try to handle minting with chainlink automation listening for "Response" event from function above
     */
    function mintNft() public {
        require(
            !s_hasMinted[msg.sender],
            "BuidlGuidl members are only allowed to mint one NFT"
        );
        require(
            s_memberToData[msg.sender].buildCount > 0,
            "You must ship at least one build to earn NFT"
        );
        _safeMint(msg.sender, s_tokenCounter);
        s_hasMinted[msg.sender] = true;
        emit Minted(msg.sender, s_tokenCounter);
        s_tokenCounter++;
    }

    // Getters
    function getBuidlCount(address memberAddr) public view returns (uint256) {
        return s_memberToData[memberAddr].buildCount;
    }

    function getEnsName(
        address memberAddr
    ) public view returns (string memory) {
        return s_memberToData[memberAddr].ensName;
    }

    function getLatestTokenId() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getHasMinted(address memberAddr) public view returns (bool) {
        return s_hasMinted[memberAddr];
    }

    function getLatestRequestId() public view returns (bytes32) {
        return s_lastRequestId;
    }

    function getRarityDetails(
        RarityTier tier
    ) public view returns (string memory, string memory) {
        RarityAttributes memory attributes = s_rarityDetails[tier];
        return (attributes.name, attributes.hexColor);
    }
}
