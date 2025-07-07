package com.example.familiytree.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "person")
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"
)
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Temporal(TemporalType.DATE)
    private Date birthdate;

    @ManyToMany
    @JoinTable(
            name = "person_parents",
            joinColumns = @JoinColumn(name = "child_id"),
            inverseJoinColumns = @JoinColumn(name = "parent_id")
    )
    private List<Person> parents = new ArrayList<>();

    @ManyToMany(mappedBy = "parents")
    private List<Person> children = new ArrayList<>();

    // Getters and setters

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public Date getBirthdate() { return birthdate; }

    public void setBirthdate(Date birthdate) { this.birthdate = birthdate; }

    public List<Person> getParents() { return parents; }

    public void setParents(List<Person> parents) { this.parents = parents; }

    public List<Person> getChildren() { return children; }

    public void setChildren(List<Person> children) { this.children = children; }
}
