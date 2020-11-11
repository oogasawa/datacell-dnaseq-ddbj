"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse_entries = void 0;
const n_readlines_1 = __importDefault(require("n-readlines"));
const object_path_1 = __importDefault(require("object-path"));
/**
 *
 * @param fname
 */
function parse_entries(fname) {
    const liner = new n_readlines_1.default(fname);
    let line;
    const pDefinition = /^DEFINITION\s+(\S.+)/;
    const pOtherLine = /^\s+(\S.+)/;
    const pAccession = /^ACCESSION\s+(\S+)/;
    const pOrganism = /^\s+ORGANISM\s+(.+)/;
    const pOtherHeader = /^(\S+)/;
    const pEnd = /^\/\//;
    let data = {};
    let state = 0;
    let lineNo = 0;
    while (line = liner.next()) {
        lineNo++;
        // if (lineNo > 200) {
        //     break;
        // }
        // console.log(sprintf("%d  %s", state, line.toString()));
        let m = pDefinition.exec(line.toString());
        if (m != null) { // matched!!
            object_path_1.default.set(data, "definition", m[1]);
            state = 1;
            continue;
        }
        m = pOtherLine.exec(line.toString());
        if (state === 1 && m != null) {
            let definition = object_path_1.default.get(data, "definition");
            definition = definition.concat(" ", m[1]);
            object_path_1.default.set(data, "definition", definition);
            state = 2;
            continue;
        }
        m = pAccession.exec(line.toString());
        if (m != null) { // matched!!
            object_path_1.default.set(data, "accession", m[1]);
            print_definition(data);
            state = 0;
            continue;
        }
        m = pOrganism.exec(line.toString());
        if (m != null) { // matched!!
            object_path_1.default.set(data, "organism", m[1]);
            print_organism(data);
            state = 0;
            continue;
        }
        m = pOtherHeader.exec(line.toString());
        if (m != null) { // matched!!
            state = 0;
            continue;
        }
    }
}
exports.parse_entries = parse_entries;
function print_definition(data) {
    let category = "entry";
    let id = object_path_1.default.get(data, "accession");
    let predicate = "definition";
    let value = object_path_1.default.get(data, "definition");
    console.log([category, id, predicate, value].join("\t"));
}
function print_organism(data) {
    let category = "entry";
    let id = object_path_1.default.get(data, "accession");
    let predicate = "organism";
    let value = object_path_1.default.get(data, "organism");
    console.log([category, id, predicate, value].join("\t"));
}
// main();
