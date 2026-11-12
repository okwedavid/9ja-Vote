import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nine_ja_vote/app.dart';
import 'package:nine_ja_vote/widgets/demo_banner.dart';

void main() {
  testWidgets('welcome screen shows the brand and the demonstration banner', (tester) async {
    await tester.pumpWidget(const NineJaVoteApp());
    expect(find.text('9ja Vote'), findsOneWidget);
    expect(find.byType(DemoBanner), findsOneWidget);
    expect(find.text('Get started'), findsOneWidget);
  });

  testWidgets('Get started opens the home screen, still marked as a demonstration', (tester) async {
    await tester.pumpWidget(const NineJaVoteApp());
    await tester.tap(find.widgetWithText(FilledButton, 'Get started'));
    await tester.pumpAndSettle();
    expect(find.text('Welcome'), findsOneWidget);
    expect(find.byType(DemoBanner), findsOneWidget);
  });
}
