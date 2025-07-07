package com.example.familiytree.controller;

import com.example.familiytree.dto.PersonDTO;
import com.example.familiytree.dto.PersonRequest;
import com.example.familiytree.model.Person;
import com.example.familiytree.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/persons")
@CrossOrigin(origins = "*")
public class PersonController {

    @Autowired
    private PersonService personService;

    /*@GetMapping
    public List<Person> getAllPersons() {
        return personService.getAll();
    }*/

    @GetMapping
    public List<PersonDTO> getAllPersons() {
        return personService.getAllAsDTO();
    }


    @PostMapping
    public ResponseEntity<Person> createPerson(@RequestBody PersonRequest request) {
        Person created = personService.createPerson(
                request.getPerson(),
                request.getParentIds() != null ? request.getParentIds() : new ArrayList<>()
        );
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerson(@PathVariable Long id) {
        personService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
