package com.com.yourproject.communityapp;

public record BudgetRequest(
    double monthlyIncome,
    double targetRent,
    double groceries,
    double transportation,
    double otherExpenses
) {}