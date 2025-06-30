use std::fs;
use std::path::Path;
use std::process::Command;

fn main() {
    let idl_path = "../../ts-sdk/src/idl/";

    if !Path::new(idl_path).exists() {
        fs::create_dir_all(idl_path).expect("Failed to create idl directory");
    }

    Command::new("sh")
        .args(["-c", "cp ../../target/idl/*.json ../../ts-sdk/src/idl/"])
        .status()
        .expect("Failed to copy IDL json files");

    Command::new("sh")
        .args(["-c", "cp ../../target/types/*.ts ../../ts-sdk/src/idl/"])
        .status()
        .expect("Failed to copy type definition ts files");
}
