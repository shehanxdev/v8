// Copyright 2021 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --allow-natives-syntax

// Tier-up across Realms

// Ensure a feedback vector is created when sharing baseline code.
(function() {
  function factory1() {
    return function(a) {
      return a;
    }
  }

  var realm1 = Realm.createAllowCrossRealmAccess();
  var realm2 = Realm.createAllowCrossRealmAccess();

  let f1 = Realm.eval(realm1, "(" + factory1.toString() + ")")();
  let f2 = Realm.eval(realm2, "(" + factory1.toString() + ")")();

  %CompileBaseline(f1);
  assertEquals(0, f1(0));
  assertTrue(isSparkplug(f1));
  assertFalse(isSparkplug(f2));

  assertEquals(0, f2(0));
  assertTrue(isSparkplug(f1));
  assertTrue(isSparkplug(f2));
})();

// Ensure a feedback vector is created when sharing baseline code and a closure
// feedback cell array already exists.
(function() {
  function factory2() {
    return function(a) {
      return a;
    }
  }

  var realm1 = Realm.createAllowCrossRealmAccess();
  var realm2 = Realm.createAllowCrossRealmAccess();

  let f1 = Realm.eval(realm1, "(" + factory2.toString() + ")")();
  let realmFactory = Realm.eval(realm2, "(" + factory2.toString() + ")");
  let f2 = realmFactory();
  let f3 = realmFactory();

  assertEquals(0, f2(0));
  %CompileBaseline(f1);
  assertEquals(0, f1(0));
  assertTrue(isSparkplug(f1));
  assertFalse(isSparkplug(f2));
  assertFalse(isSparkplug(f3));

  assertEquals(0, f3(0));
  assertTrue(isSparkplug(f3));
  assertFalse(isSparkplug(f2));

  assertEquals(0, f2(0));
  assertTrue(isSparkplug(f2));
})();