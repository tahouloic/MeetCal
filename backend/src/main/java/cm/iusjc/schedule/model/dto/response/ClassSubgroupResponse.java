package cm.iusjc.schedule.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassSubgroupResponse {
    
    private UUID id;
    private String code;
    private String name;
    private Integer groupNumber;
    private Integer studentCount;
    private ClassGroupResponse classGroup;
    private CourseResponse course;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
