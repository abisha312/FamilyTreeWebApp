package com.example.familiytree.service;

import com.example.familiytree.dto.PersonDTO;
import com.example.familiytree.model.Person;
import com.example.familiytree.repository.PersonRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PersonService {

    @Autowired
    private PersonRepository personRepository;

    @Transactional
    public Person createPerson(Person person, List<Long> parentIds) {
        List<Person> parents = new ArrayList<>();
        if (parentIds != null && !parentIds.isEmpty()) {
            for (Long id : parentIds) {
                Person parent = personRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Parent not found with ID: " + id));
                parents.add(parent);
            }
        }
        person.setParents(parents);
        return personRepository.save(person);
    }

    public List<Person> getAll() {
        return personRepository.findAll();
    }

    public Optional<Person> getById(Long id) {
        return personRepository.findById(id);
    }

    public void deleteById(Long id) {
        personRepository.deleteById(id);
    }

    public List<PersonDTO> getAllAsDTO() {
        List<Person> persons = personRepository.findAll();

        return persons.stream().map(p -> new PersonDTO(
                p.getId(),
                p.getName(),
                p.getBirthdate(),
                p.getGender(), // ✅ include gender
                p.getBio(),    // ✅ include bio
                p.getParents().stream()
                        .map(parent -> new PersonDTO.SimplePerson(parent.getId(), parent.getName()))
                        .toList()
        )).toList();
    }

    @Transactional
    public Person addParent(Long childId, Long parentId) {
        Person child = personRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Child not found with ID: " + childId));
        Person parent = personRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found with ID: " + parentId));

        if (!child.getParents().contains(parent)) {
            child.getParents().add(parent);
        }

        return personRepository.save(child);
    }
}
