// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * Basic setup for dynamic svg nft project
 *
 *
 * MemberData.ensName sourced from frontend that queries mainnet ens registry
 * MemberData.buildCount comes from chainlink function
 */
contract BuidlGuidlNft is ERC721 {
    struct MemberData {
        string ensName;
        uint8 buildCount;
    }

    mapping(address => MemberData) public s_memberToData;
    uint256 private s_tokenCounter;
    string private constant base64EncodedSvgPrefix =
        "data:image/svg+xml;base64,";
    string[] private s_backgroundColors = [
        "#4f46e5",
        "#ef4444",
        "#10b981",
        "#3b82f6",
        "#f59e0b"
    ];

    /**
     * First NFT minted has tokenId of 0
     */
    constructor() ERC721("Buidl Guidl", "BGDL") {
        s_tokenCounter = 0;
    }

    /**
     *  Had to split encoding of image uri string into two parts to avoid "stack too deep" error caused by huge string concat and encoding in single function
     *
     */
    function svgToImageURI(
        uint256 tokenId
    ) public view returns (string memory) {
        uint256 colorIndex = tokenId % s_backgroundColors.length;
        string memory color = s_backgroundColors[colorIndex];
        string memory svgPart1 = buildSvgPart1(color);
        string memory svgPart2 = buildSvgPart2(color, tokenId);

        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svgPart1, svgPart2)))
        );
        return
            string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    /**
     *  The top half of the svg that shows above the ens name display
     * 
     * @param backgroundColor used to fill background of svg and text of ensName

     */
    function buildSvgPart1(
        string memory backgroundColor
    ) private pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<svg width="500" height="375" viewBox="0 0 500 375" font-family="Verdana, Sans" xmlns="http://www.w3.org/2000/svg">',
                    '<rect width="500" height="375" fill="',
                    backgroundColor,
                    '"/>',
                    '<g transform="translate(25, 25) scale(2.1)">',
                    '<path fill="white" fill-rule="evenodd" clip-rule="evenodd" d="M14.8867 10.1643V19.4598H17.2209V24.8329H22.9973V19.4598H27.0062V30.206L20.7013 42.0233L13.5031 41.9146L6.30486 42.0233L0 30.206V19.4598H3.99065V24.8329H9.78528V19.4598H12.3588V1.26395C12.3588 0.565889 12.9247 0 13.6228 0C14.1263 0 14.561 0.2944 14.7642 0.72045C15.4031 0.965338 16.0466 1.61238 16.7119 2.28137C17.5022 3.07602 18.3232 3.90163 19.2039 4.12095C20.0931 4.34242 20.7524 4.10563 21.4951 3.83887C22.2743 3.559 23.1453 3.24616 24.4701 3.39486C25.4635 3.51174 25.9901 4.16046 26.5791 4.88586C27.3621 5.85033 28.2552 6.95035 30.5016 7.11611L30.4874 7.12612C29.0491 8.14179 27.084 9.5295 24.0327 9.2581C23.0785 9.17577 22.4062 8.86812 21.7616 8.57316C20.8429 8.15279 19.9805 7.75817 18.4385 8.07819C16.7695 8.41302 15.9262 9.20317 15.2849 9.80403C15.1447 9.9354 15.0141 10.0577 14.8867 10.1643Z"/>',
                    "</g>"
                    '<text fill="white" x="90" y="115" font-size="77">BuidlGuidl</text>',
                    '<rect fill="white" x="0" y="160" width="500" height="60"/>'
                )
            );
    }

    /**
     * @notice addressString is used as fallback if ensName is not set
     * @param textColor text color for buildCount number (matches the background color)
     * @param tokenId to get the address of the NFT owner used to lookup dynamic ens name and buildCount
     */
    function buildSvgPart2(
        string memory textColor,
        uint256 tokenId
    ) private view returns (string memory) {
        address ownerAddr = ownerOf(tokenId);

        string memory buildCount = Strings.toString(
            s_memberToData[ownerAddr].buildCount
        );
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

        return
            string(
                abi.encodePacked(
                    identity,
                    '<circle fill="white" cx="440" cy="300" r="38" />',
                    '<text  x="440" y="300" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="',
                    textColor,
                    '">',
                    buildCount,
                    "</text>",
                    '<text fill="white" x="25" y="315" font-size="43" font-weight="bold">Builds Shipped</text>',
                    "</svg>"
                )
            );
    }

    /**
     * 1. send chainlink function request to get member data
     * 2. update state variable mappings with member data
     * 3. mint new NFT
     *
     */
    function minNft() public {
        _safeMint(msg.sender, s_tokenCounter);
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
                                '", "description": "Dynamic SVG NFT for Buidl Guidl members only", "attributes": [{"trait_type": "coolness", "value": "100"}], "image": "',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}
