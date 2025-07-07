package com.example.familiytree.dto;

import java.util.Date;
import java.util.List;

public class PersonDTO {
    private Long id;
    private String name;
    private Date birthdate;
    private List<SimplePerson> parents;

    public static class SimplePerson {
        private Long id;
        private String name;

        public SimplePerson(Long id, String name) {
            this.id = id;
            this.name = name;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
    }

    public PersonDTO(Long id, String name, Date birthdate, List<SimplePerson> parents) {
        this.id = id;
        this.name = name;
        this.birthdate = birthdate;
        this.parents = parents;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public Date getBirthdate() { return birthdate; }
    public List<SimplePerson> getParents() { return parents; }
}
