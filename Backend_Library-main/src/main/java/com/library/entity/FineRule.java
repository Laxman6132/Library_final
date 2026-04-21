package com.library.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
public class FineRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int fineRuleId;

    private int overdueDays;

    private int fineAmountPerDay;

    public int getFineRuleId() {
        return fineRuleId;
    }

    public void setFineRuleId(int fineRuleId) {
        this.fineRuleId = fineRuleId;
    }

    public int getOverdueDays() {
        return overdueDays;
    }

    public void setOverdueDays(int overdueDays) {
        this.overdueDays = overdueDays;
    }

    public int getFineAmountPerDay() {
        return fineAmountPerDay;
    }

    public void setFineAmountPerDay(int fineAmountPerDay) {
        this.fineAmountPerDay = fineAmountPerDay;
    }

    @Override
    public String toString() {
        return "FineRule{" +
                "fineRuleId=" + fineRuleId +
                ", overdueDays=" + overdueDays +
                ", fineAmountPerDay=" + fineAmountPerDay +
                '}';
    }

    public FineRule() {
    }

    public FineRule(int fineRuleId, int overdueDays, int fineAmountPerDay) {
        this.fineRuleId = fineRuleId;
        this.overdueDays = overdueDays;
        this.fineAmountPerDay = fineAmountPerDay;
    }
}
