package com.library.repository;

import com.library.entity.WaitingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WaitingListRepository extends JpaRepository<WaitingList,Integer> {
    List<WaitingList> findByBookBookId(int bookId);
    List<WaitingList> findByUserUserId(int userId);
}
