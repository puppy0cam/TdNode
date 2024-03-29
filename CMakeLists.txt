cmake_minimum_required(VERSION 3.1 FATAL_ERROR)

IF(WIN32)
ADD_DEFINITIONS(/bigobj)
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /bigobj")
SET(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} /bigobj")
ENDIF(WIN32)

project(TdNode VERSION 1.0.4 LANGUAGES CXX)

set(Td_DIR "tdlib/lib/cmake/Td")
execute_process(
    COMMAND node -p "require('node-addon-api').include"
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    OUTPUT_VARIABLE NODE_ADDON_API_DIR
)
string(REPLACE "\n" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
string(REPLACE "\"" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
find_package(Td 1.7.9 REQUIRED)

include_directories(${CMAKE_JS_INC})

file(GLOB SOURCE_FILES "src/TdNode.cpp")

add_library(TdNode SHARED ${SOURCE_FILES} ${CMAKE_JS_SRC})

set_target_properties(TdNode PROPERTIES PREFIX "" SUFFIX ".node" CXX_STANDARD 17)

target_include_directories(TdNode PRIVATE ${NODE_ADDON_API_DIR} PRIVATE ${CMAKE_JS_INC})

target_link_libraries(TdNode PRIVATE Td::TdStatic PUBLIC ${CMAKE_JS_LIB})
