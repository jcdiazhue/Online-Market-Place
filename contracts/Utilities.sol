pragma solidity ^0.4.24;

/// @title Utilities Lib
/// @author José Carlos Díaz Huélamo
library Utilities {

    /// @notice Retrieve the result of a multiplication
    /// @param firstNumber The first number.
    /// @param secondNumber The second number.
    /// @return The result.
    function multiplication(uint firstNumber, uint secondNumber) public pure returns (uint result) {
        if (firstNumber == 0) {
            result = 0;
        } else {
            result = firstNumber * secondNumber;
            // Save the Integer Overflow in Ethereum Smart Contracts
            require(result / firstNumber == secondNumber, "Integer Overflow Bug");
        }
    }      
}