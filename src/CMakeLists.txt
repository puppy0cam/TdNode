cmake_minimum_required(VERSION 3.1 FATAL_ERROR)

project(TdNode)

SET(Td_DIR "./td/lib/cmake/Td")

find_package(Td 1.5.5 REQUIRED)

include_directories(${CMAKE_JS_INC})

file(GLOB SOURCE_FILES "TdNode.cpp")

add_library(${PROJECT_NAME} SHARED ${SOURCE_FILES} ${CMAKE_JS_SRC})

set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node" CXX_STANDARD 17)

SET(NODE_ADDON_API_DIR "../../../../node_modules/node-addon-api")

target_include_directories(${PROJECT_NAME} PRIVATE ${NODE_ADDON_API_DIR} PRIVATE ${CMAKE_JS_INC})

target_link_libraries(${PROJECT_NAME} PRIVATE Td::TdStatic PUBLIC ${CMAKE_JS_LIB})
