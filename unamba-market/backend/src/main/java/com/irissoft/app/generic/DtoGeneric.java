package com.irissoft.app.generic;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class DtoGeneric {
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}