
import { ArgumentParser } from "argparse";
import { version } from "../../package.json";
import lineByLine from "n-readlines";


function main(): void {

    const parser = new ArgumentParser({
        description: "DDBJ Flat File Parser"
    });

    parser.add_argument('file');

    const args = parser.parse_args();
    // console.dir(args);
    get_accession_to_db_xref(args.file);
}


/**  
 * 
 * @param fname
 */
function get_accession_to_db_xref(fname: string): void {
    const liner = new lineByLine(fname);

    let line: false | Buffer;
    const p0 = /^LOCUS\s+(\S+)/;
    const p1 = /^ACCESSION\s+(\S+)/;
    const p2 = /\/db_xref="(\S+)"/;

    let data = {};

    while (line = liner.next()) {

        let m = p0.exec(line.toString());
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

            let output = [
                "accession",
                data["accession"],
                "db_xref",
                m[1]
            ];

            console.log(output.join("\t"));
            continue;
        }


    }


}


main();

