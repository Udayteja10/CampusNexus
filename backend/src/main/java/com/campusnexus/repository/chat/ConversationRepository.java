package com.campusnexus.repository.chat;

import com.campusnexus.entity.chat.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c JOIN c.participants cp WHERE cp.user.id = :userId ORDER BY c.updatedAt DESC")
    List<Conversation> findConversationsByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT c.* FROM conversations c " +
                   "JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = :user1Id " +
                   "JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = :user2Id " +
                   "LIMIT 1", nativeQuery = true)
    Optional<Conversation> findDirectConversationBetweenUsers(
            @Param("user1Id") Long user1Id,
            @Param("user2Id") Long user2Id
    );
}
