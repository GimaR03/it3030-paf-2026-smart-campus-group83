package com.smartcampus.operations_hubdemo.repository;

import com.smartcampus.operations_hubdemo.model.Booking;
import com.smartcampus.operations_hubdemo.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByRequestedByUserIdOrderByDateDescStartTimeDesc(Long requestedByUserId);

    List<Booking> findByResourceIdAndDateAndStatusIn(Long resourceId, LocalDate date, Collection<BookingStatus> statuses);
}
