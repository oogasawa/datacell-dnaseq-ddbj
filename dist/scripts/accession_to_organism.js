"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var argparse_1 = require("argparse");
var n_readlines_1 = __importDefault(require("n-readlines"));
function main() {
    var parser = new argparse_1.ArgumentParser({
        description: "DDBJ Flat File Parser"
    });
    parser.add_argument('file');
    var args = parser.parse_args();
    // console.dir(args);
    get_accession_to_organism(args.file);
}
/**
 *
 * @param fname
 */
function get_accession_to_organism(fname) {
    var liner = new n_readlines_1.default(fname);
    var line;
    var p0 = /^LOCUS\s+(\S+)/;
    var p1 = /^ACCESSION\s+(\S+)/;
    var p2 = /ORGANISM\s+(.+)/;
    var data = {};
    while (line = liner.next()) {
        var m = p0.exec(line.toString());
        if (m != null) { // matched!!
            data = {};
            continue;
        }
        m = p1.exec(line.toString());
        if (m != null) { // matched!!
            data["accession"] = m[1];
            // console.log(m[1]);
            continue;
        }
        m = p2.exec(line.toString());
        if (m != null) { // matched!!
            var output = [
                "accession",
                data["accession"],
                "organism",
                m[1]
            ];
            console.log(output.join("\t"));
            continue;
        }
    }
}
main();
