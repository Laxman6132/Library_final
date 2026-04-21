package com.library.repository;

import com.library.entity.Favourite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavouriteRepository extends JpaRepository<Favourite,Integer> {
    List<Favourite> findByBookBookId(int bookId);
    List<Favourite> findByUserUserId(int userId);
}
