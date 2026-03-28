// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily check-in on Base. One successful call per UTC calendar day per address.
/// @dev Day index is `block.timestamp / 1 days` (Unix epoch days). Storage uses `day + 1` with 0 meaning "never checked in".
contract CheckIn {
    /// @notice Encoded last check-in: 0 = never; otherwise `lastUtcDay + 1`.
    mapping(address user => uint256 encoded) private lastCheckInEncoded;

    event CheckedIn(address indexed user, uint256 indexed day);

    error NoEthAccepted();
    error AlreadyCheckedInToday();

    /// @notice Last UTC day index when `user` checked in; 0 if never.
    function lastCheckInDay(address user) external view returns (uint256) {
        uint256 e = lastCheckInEncoded[user];
        return e == 0 ? 0 : e - 1;
    }

    /// @notice Record today's check-in. Caller pays only L2 gas; ETH transfers are rejected.
    function checkIn() external payable {
        if (msg.value != 0) revert NoEthAccepted();

        uint256 day = block.timestamp / 1 days;
        uint256 enc = lastCheckInEncoded[msg.sender];
        if (enc != 0) {
            uint256 lastDay = enc - 1;
            if (lastDay == day) revert AlreadyCheckedInToday();
        }

        lastCheckInEncoded[msg.sender] = day + 1;
        emit CheckedIn(msg.sender, day);
    }

    /// @return Whether `user` can call `checkIn` successfully right now.
    function canCheckIn(address user) external view returns (bool) {
        uint256 day = block.timestamp / 1 days;
        uint256 enc = lastCheckInEncoded[user];
        if (enc == 0) return true;
        return enc - 1 != day;
    }
}
