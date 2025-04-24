import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import {ServiceClientConstructor} from "@grpc/grpc-js";

import {ProtoGrpcType} from "./generated/a";

const packageDefinition = protoLoader.loadSync(path.join(__dirname, './a.proto'));

const personProto = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType;

const PERSONS = [
    {
        name: "zain",
        age: 45
    },
    {
        name: "ali",
        age: 45
    },
];

// @ts-ignore
function addPerson(call, callback) {
    let person = {
        name: call.request.name,
        age: call.request.age
    }
    PERSONS.push(person);
    callback(null, person)
}

// @ts-ignore
function getPersonByName(call, callback) {
    const person = PERSONS.find(p => p.name === call.request.name);
    callback(null, person ? person : {message: "Person not found"});
}

const server = new grpc.Server();

server.addService((personProto.AddressBookService as ServiceClientConstructor).service, {
    addPerson: addPerson,
    getPersonByName: getPersonByName
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Server running at http://0.0.0.0:50051');
    server.start();
});
