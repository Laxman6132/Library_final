package com.library.repository;

import com.library.entity.FineRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FineRuleRepository extends JpaRepository<FineRule, Integer> {
}
