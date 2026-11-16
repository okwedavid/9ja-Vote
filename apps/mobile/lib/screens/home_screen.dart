import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../widgets/aso_rock_background.dart';
import '../widgets/demo_banner.dart';
import 'education_screen.dart';
import 'elections_screen.dart';
import 'parties_screen.dart';
import 'polling_units_screen.dart';
import 'results_screen.dart';
import 'settings_screen.dart';

class _Slide {
  const _Slide(this.asset, this.title);
  final String asset;
  final String title;
}

const _slides = [
  _Slide('assets/images/aso-rock.jpg', 'Rooted in Abuja'),
  _Slide('assets/images/slide-ballot.jpg', 'One person, one vote — by design'),
  _Slide('assets/images/slide-map.jpg', 'Results you can trace'),
  _Slide('assets/images/slide-flag.jpg', 'Your Voice. Your Future. Your Nigeria.'),
  _Slide('assets/images/slide-gate.jpg', 'Built for every Nigerian'),
];

const _modules = <(IconData, String)>[
  (Icons.how_to_vote, 'Voter education'),
  (Icons.event, 'Election calendar'),
  (Icons.groups, 'Parties'),
  (Icons.person_search, 'Candidates'),
  (Icons.place, 'Polling unit info'),
  (Icons.bar_chart, 'Results demo'),
  (Icons.badge, 'Identity demo'),
  (Icons.support_agent, 'Help & support'),
];

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _controller = PageController(viewportFraction: 0.82);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _openModule(BuildContext context, int index) {
    final route = switch (index) {
      0 => MaterialPageRoute<void>(builder: (_) => const EducationScreen()),
      1 => MaterialPageRoute<void>(builder: (_) => const ElectionsScreen()),
      2 => MaterialPageRoute<void>(builder: (_) => const PartiesScreen()),
      3 => MaterialPageRoute<void>(builder: (_) => const PartiesScreen()),
      4 => MaterialPageRoute<void>(builder: (_) => const PollingUnitsScreen()),
      5 => MaterialPageRoute<void>(builder: (_) => const ResultsScreen()),
      7 => MaterialPageRoute<void>(builder: (_) => const SettingsScreen()),
      _ => null,
    };
    if (route == null) {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          const SnackBar(
            content: Text('Identity verification demo is disabled: this app never collects biometric or identity data.'),
          ),
        );
      return;
    }
    Navigator.of(context).push(route);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AsoRockBackground(
        tint: 0.7,
        child: SafeArea(
          child: Column(
            children: [
              const DemoBanner(),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  children: [
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 20),
                      child: Text(
                        'Welcome',
                        style: TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w800),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 210,
                      child: PageView.builder(
                        controller: _controller,
                        itemCount: _slides.length,
                        itemBuilder: (context, index) => AnimatedBuilder(
                          animation: _controller,
                          builder: (context, child) {
                            // Tilt neighbouring cards in 3D as the page scrolls.
                            var delta = 0.0;
                            if (_controller.hasClients && _controller.position.haveDimensions) {
                              delta = (_controller.page ?? index.toDouble()) - index;
                            }
                            final matrix = Matrix4.identity()
                              ..setEntry(3, 2, 0.0015)
                              ..rotateY(delta.clamp(-1.0, 1.0) * 0.6);
                            return Transform(alignment: Alignment.center, transform: matrix, child: child);
                          },
                          child: _SlideCard(slide: _slides[index]),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                        childAspectRatio: 1.35,
                        children: [
                          for (var i = 0; i < _modules.length; i++)
                            _ModuleTile(
                              icon: _modules[i].$1,
                              label: _modules[i].$2,
                              onTap: () => _openModule(context, i),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SlideCard extends StatelessWidget {
  const _SlideCard({required this.slide});
  final _Slide slide;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(slide.asset, fit: BoxFit.cover, semanticLabel: slide.title),
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.center,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Color(0xE6021E14)],
                ),
              ),
            ),
            Positioned(
              left: 16,
              right: 16,
              bottom: 14,
              child: Text(
                slide.title,
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ModuleTile extends StatelessWidget {
  const _ModuleTile({required this.icon, required this.label, required this.onTap});
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white.withValues(alpha: 0.94),
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: AppColors.green, size: 36),
              const SizedBox(height: 8),
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.emerald, fontSize: 16, fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
