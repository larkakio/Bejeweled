// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CheckIn} from "../src/CheckIn.sol";

contract CheckInTest is Test {
    CheckIn public c;
    address alice = address(0xA11ce);

    function setUp() public {
        c = new CheckIn();
    }

    function test_checkIn_first_time() public {
        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        uint256 day = block.timestamp / 1 days;
        emit CheckIn.CheckedIn(alice, day);
        c.checkIn();
        assertEq(c.lastCheckInDay(alice), day);
    }

    function test_checkIn_reverts_same_day() public {
        vm.startPrank(alice);
        c.checkIn();
        vm.expectRevert(CheckIn.AlreadyCheckedInToday.selector);
        c.checkIn();
        vm.stopPrank();
    }

    function test_checkIn_next_day() public {
        vm.prank(alice);
        c.checkIn();
        vm.warp(block.timestamp + 1 days);
        vm.prank(alice);
        c.checkIn();
        uint256 day = block.timestamp / 1 days;
        assertEq(c.lastCheckInDay(alice), day);
    }

    function test_checkIn_reverts_with_value() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert(CheckIn.NoEthAccepted.selector);
        c.checkIn{value: 1 wei}();
    }

    function test_canCheckIn() public {
        assertTrue(c.canCheckIn(alice));
        vm.prank(alice);
        c.checkIn();
        assertFalse(c.canCheckIn(alice));
    }
}
