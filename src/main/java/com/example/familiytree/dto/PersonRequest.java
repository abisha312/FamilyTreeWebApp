package com.example.familiytree.dto;

import com.example.familiytree.model.Person;
import java.util.List;

public class PersonRequest {
    private Person person;
    private List<Long> parentIds;

    public Person getPerson() {
        return person;
    }

    public void setPerson(Person person) {
        this.person = person;
    }

    public List<Long> getParentIds() {
        return parentIds;
    }

    public void setParentIds(List<Long> parentIds) {
        this.parentIds = parentIds;
    }
}
