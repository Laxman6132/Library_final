package com.library.dto;

public class FineRuleDTO {

    private int fineRuleId;
    private int overdueDays;
    private int fineAmountPerDay;

    @Override
    public String toString() {
        return "FineRuleDTO{" +
                "fineRuleId=" + fineRuleId +
                ", overdueDays=" + overdueDays +
                ", fineAmountPerDay=" + fineAmountPerDay +
                '}';
    }

    public FineRuleDTO() {
    }

    public FineRuleDTO(int fineRuleId, int overdueDays, int fineAmountPerDay) {
        this.fineRuleId = fineRuleId;
        this.overdueDays = overdueDays;
        this.fineAmountPerDay = fineAmountPerDay;
    }

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
}
