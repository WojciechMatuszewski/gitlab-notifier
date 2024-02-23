#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{command, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tauri_plugin_positioner::{Position, WindowExt};

fn main() {
    let system_tray_menu = SystemTrayMenu::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        .system_tray(SystemTray::new().with_menu(system_tray_menu))
        .on_system_tray_event(|app, event| {
            tauri_plugin_positioner::on_tray_event(app, &event);

            match event {
                SystemTrayEvent::LeftClick { .. } => {
                    let window = app.get_window("main").unwrap();
                    window.move_window(Position::TrayCenter).unwrap();

                    if window.is_visible().unwrap() {
                        window.hide().unwrap()
                    } else {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                _ => {}
            }
        })
        // .on_window_event(|event| match event.event() {
        //     tauri::WindowEvent::Focused(is_focused) => {
        //         if !is_focused {
        //             event.window().hide().unwrap();
        //         }
        //     }
        //     _ => {}
        // })
        .invoke_handler(tauri::generate_handler![set_count])
        .run(tauri::generate_context!())
        .expect("foo")
}

#[command]
fn set_count(app_handle: tauri::AppHandle, count: &str) {
    app_handle.tray_handle().set_title(count).unwrap();
}

// fn main() {
//     let quit = CustomMenuItem::new("quit".to_string(), "Quit").accelerator("Cmd+Q");
//     let system_tray_menu = SystemTrayMenu::new().add_item(quit);
//     tauri::Builder::default()
//         .plugin(tauri_plugin_positioner::init())
//         .system_tray(SystemTray::new().with_menu(system_tray_menu))
//         .on_system_tray_event(|app, event| {
//             tauri_plugin_positioner::on_tray_event(app, &event);
//             match event {
//                 SystemTrayEvent::LeftClick {
//                     position: _,
//                     size: _,
//                     ..
//                 } => {
//                     let window = app.get_window("main").unwrap();
//                     let _ = window.move_window(Position::TrayCenter);

//                     if window.is_visible().unwrap() {
//                         window.hide().unwrap();
//                     } else {
//                         window.show().unwrap();
//                         window.set_focus().unwrap();
//                     }
//                 }
//                 SystemTrayEvent::RightClick {
//                     position: _,
//                     size: _,
//                     ..
//                 } => {
//                     println!("system tray received a right click");
//                 }
//                 SystemTrayEvent::DoubleClick {
//                     position: _,
//                     size: _,
//                     ..
//                 } => {
//                     println!("system tray received a double click");
//                 }
//                 SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
//                     "quit" => {
//                         std::process::exit(0);
//                     }
//                     "hide" => {
//                         let window = app.get_window("main").unwrap();
//                         window.hide().unwrap();
//                     }
//                     _ => {}
//                 },
//                 _ => {}
//             }
//         })
//         .on_window_event(|event| match event.event() {
//             tauri::WindowEvent::Focused(is_focused) => {
//                 // detect click outside of the focused window and hide the app
//                 if !is_focused {
//                     event.window().hide().unwrap();
//                 }
//             }
//             _ => {}
//         })
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }
