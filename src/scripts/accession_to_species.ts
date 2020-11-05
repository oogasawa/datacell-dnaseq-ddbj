
import { ArgumentParser } from "argparse";
import { version } from "../../package.json";
import lineByLine from "n-readlines";
import * as objectPath from "object-path";


function main(): void {

    const parser = new ArgumentParser({
        description: "DDBJ Flat File Parser"
    });

    parser.add_argument('file');

    const args = parser.parse_args();
    // console.dir(args);
    parse_entries(args.file);
}


/**  
 * 
 * @param fname
 */
function parse_entries(fname: string): void {
    const liner = new lineByLine(fname);

    let line: false | Buffer;
    const pDefinition = /^DEFINITION\s+(\S+)/;
    const pOtherLine = /^\s+(\S.+)/;
    const pAccession = /^ACCESSION\s+(\S+)/;
    const pOrganism = /^\s+ORGANISM\s+(.+)/;
    const pOtherHeader = /^(\S+)/;
    const pEnd = /^\/\//;


    let data = {};
    let state = 0;
    while (line = liner.next()) {

        let m = pDefinition.exec(line.toString());
        if (m != null) { // matched!!
            objectPath.set(data, "definition", m[1]);
            state = 1;
            continue;
        }


        m = pOtherLine.exec(line.toString());
        if (state === 1 && m != null) {
            let definition: string = objectPath.get(data, "definition");
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


function print_definition(data: object): void {

    let category: string = "entry";
    let id: string = objectPath.get(data, "accession");
    let predicate: string = "definition";
    let value: string = objectPath.get(data, "definition");

    console.log([category, id, predicate, value].join("\t"));

}



function print_organism(data: object): void {

    let category: string = "entry";
    let id: string = objectPath.get(data, "accession");
    let predicate: string = "organism";
    let value: string = objectPath.get(data, "organism");

    console.log([category, id, predicate, value].join("\t"));

}


main();

