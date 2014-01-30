/*
 * Copyright 2013 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include <string>
#include <sstream>
#include <json/reader.h>
#include <json/writer.h>
#include "UrbanAirship_ndk.hpp"
#include "PushUA_js.hpp"

namespace webworks {

UrbanAirship::UrbanAirship(PushUA *parent) {
	m_pParent = parent;
}

UrbanAirship::~UrbanAirship() {
}

// These methods are the true native code we intend to reach from WebWorks
std::string UrbanAirship::templateTestString() {
	return "UrbanAirship test";
}

} /* namespace webworks */
