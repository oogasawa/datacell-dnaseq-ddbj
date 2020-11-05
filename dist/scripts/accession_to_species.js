"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var argparse_1 = require("argparse");
var n_readlines_1 = __importDefault(require("n-readlines"));
var objectPath = __importStar(require("object-path"));
function main() {
    var parser = new argparse_1.ArgumentParser({
        description: "DDBJ Flat File Parser"
    });
    parser.add_argument('file');
    var args = parser.parse_args();
    // console.dir(args);
    parse_entries(args.file);
}
/**
 *
 * @param fname
 */
function parse_entries(fname) {
    var liner = new n_readlines_1.default(fname);
    var line;
    var pDefinition = /^DEFINITION\s+(\S+)/;
    var pOtherLine = /^\s+(\S.+)/;
    var pAccession = /^ACCESSION\s+(\S+)/;
    var pOrganism = /^\s+ORGANISM\s+(.+)/;
    var pOtherHeader = /^(\S+)/;
    var pEnd = /^\/\//;
    var data = {};
    var state = 0;
    while (line = liner.next()) {
        var m = pDefinition.exec(line.toString());
        if (m != null) { // matched!!
            objectPath.set(data, "definition", m[1]);
            state = 1;
            continue;
        }
        m = pOtherLine.exec(line.toString());
        if (state === 1 && m != null) {
            var definition = objectPath.get(data, "definition");
            definition.concat(" ", m[1]);
            objectPath.set(data, "definition", definition);
            state = 1;
            continue;
        }
        m = pAccession.exec(line.toString());
        if (m != null) { // matched!!
            objectPath.set(data, "accesssion", m[1]);
            print_definition(data);
            state = 0;
            continue;
        }
        m = pOrganism.exec(line.toString());
        if (m != null) { // matched!!
            objectPath.set(data, "organism", m[1]);
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
function print_definition(data) {
    var category = "entry";
    var id = objectPath.get(data, "accession");
    var predicate = "definition";
    var value = objectPath.get(data, "definition");
    console.log([category, id, predicate, value].join("\t"));
}
function print_organism(data) {
    var category = "entry";
    var id = objectPath.get(data, "accession");
    var predicate = "organism";
    var value = objectPath.get(data, "organism");
    console.log([category, id, predicate, value].join("\t"));
}
main();
